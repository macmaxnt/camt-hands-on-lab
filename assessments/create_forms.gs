/**
 * Run createRagLabForms() once from script.google.com while signed in as the instructor.
 * It creates two Thai-only Forms and a linked response spreadsheet. No email collection is enabled.
 */
function createRagLabForms() {
  const spreadsheet = SpreadsheetApp.create("AIAT CAMT Lab 1 RAG - ผลการประเมิน");
  const pretest = buildForm_("Lab 1 RAG: แบบทดสอบก่อนเรียน", false, preQuestions_());
  const posttest = buildForm_("Lab 1 RAG: แบบทดสอบหลังเรียน", true, postQuestions_());
  [pretest, posttest].forEach((form) => form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId()));

  const sheet = spreadsheet.getSheets()[0];
  sheet.getRange("A1").setNote("คำตอบจากทั้งสองแบบทดสอบจะบันทึกที่นี่ เปรียบเทียบด้วยรหัสผู้เรียนแบบไม่ระบุตัวตนเท่านั้น ห้ามเพิ่มชื่อหรืออีเมล");
  Logger.log(JSON.stringify({ pretestEditUrl: pretest.getEditUrl(), pretestPublishedUrl: pretest.getPublishedUrl(), posttestEditUrl: posttest.getEditUrl(), posttestPublishedUrl: posttest.getPublishedUrl(), responseSpreadsheetUrl: spreadsheet.getUrl() }, null, 2));
}

function buildForm_(title, isQuiz, questions) {
  const form = FormApp.create(title)
    .setDescription("ใช้เวลา 10 นาที ใช้รหัสผู้เรียนแบบไม่ระบุตัวตนเดียวกันทั้งสองแบบทดสอบ ไม่ต้องกรอกชื่อหรืออีเมล")
    .setConfirmationMessage("บันทึกคำตอบเรียบร้อย โปรดเก็บรหัสผู้เรียนไว้ใช้ในแบบทดสอบหลังเรียน")
    .setCollectEmail(false)
    .setIsQuiz(isQuiz);

  form.addTextItem().setTitle("รหัสผู้เรียนแบบไม่ระบุตัวตน").setHelpText("เลือก 4-8 ตัวอักษรหรือตัวเลข และใช้รหัสเดิมในทั้งสองแบบทดสอบ").setRequired(true);
  questions.forEach((question) => addQuestion_(form, question, isQuiz));
  return form;
}

function addQuestion_(form, question, isQuiz) {
  if (question.type === "paragraph") {
    form.addParagraphTextItem().setTitle(question.title).setHelpText(question.help).setRequired(true);
    return;
  }
  const item = form.addMultipleChoiceItem().setTitle(question.title).setHelpText(question.help).setRequired(true);
  if (isQuiz) {
    item.setChoices(question.choices.map((choice) => item.createChoice(choice.text, choice.correct)));
    item.setPoints(1);
  } else {
    item.setChoices(question.choices.map((choice) => item.createChoice(choice.text)));
  }
}

function preQuestions_() {
  return [
    { type: "choice", title: "1. Retrieval ในระบบ RAG มีหน้าที่หลักอะไร", help: "เลือกหนึ่งข้อ", choices: [{ text: "เลือกหลักฐานที่อนุมัติและเกี่ยวข้องก่อนระบบตอบ", correct: true }, { text: "ให้โมเดลตอบจากความจำโดยไม่ต้องใช้เอกสาร", correct: false }, { text: "ค้นหาทุกเว็บไซต์โดยอัตโนมัติ", correct: false }] },
    { type: "choice", title: "2. เหตุใดจึงต้องแบ่งเอกสารเป็น chunk ก่อนค้นหา", help: "เลือกหนึ่งข้อ", choices: [{ text: "เพื่อค้นหาส่วนข้อความที่เกี่ยวข้องได้ละเอียดและอ้างอิงได้", correct: true }, { text: "เพื่อทำให้เอกสารหายไปจากระบบ", correct: false }, { text: "เพื่อให้คำตอบยาวขึ้นเสมอ", correct: false }] },
    { type: "choice", title: "3. ข้อมูลใดช่วยให้ผู้ใช้ตรวจสอบคำตอบ RAG ได้", help: "เลือกหนึ่งข้อ", choices: [{ text: "ชื่อแหล่งข้อมูล ข้อความที่ค้นพบ และตำแหน่งในเอกสาร", correct: true }, { text: "ชื่อโมเดลเพียงอย่างเดียว", correct: false }, { text: "สีที่แสดงความมั่นใจเท่านั้น", correct: false }] },
    { type: "choice", title: "4. หากผู้ใช้พิมพ์ชื่อรหัสรายวิชาที่ตรงกับในเอกสาร วิธีค้นหาใดเหมาะเป็นจุดเริ่มต้น", help: "เลือกหนึ่งข้อ", choices: [{ text: "ค้นหาด้วยคำสำคัญหรือการค้นหาแบบตรงกัน", correct: true }, { text: "สร้างคำตอบใหม่โดยไม่ค้นเอกสาร", correct: false }, { text: "ใช้ vector search เสมอโดยไม่พิจารณาคำถาม", correct: false }] },
    { type: "choice", title: "5. ถ้าผู้ใช้ถามคำที่ต่างจากเอกสาร แต่มีความหมายใกล้เคียง วิธีใดอาจช่วยได้", help: "เลือกหนึ่งข้อ", choices: [{ text: "semantic retrieval ด้วย vector index", correct: true }, { text: "ลบเอกสารที่มีคำต่างกัน", correct: false }, { text: "ตอบโดยไม่ต้องใช้หลักฐาน", correct: false }] },
    { type: "choice", title: "6. ผู้เรียนถามค่าเล่าเรียนของ CAMT แต่คลัง RAG มีเพียงเอกสาร UNESCO เรื่อง AI ในการศึกษา ผู้ช่วยควรทำอะไร", help: "สถานการณ์", choices: [{ text: "แจ้งว่าไม่มีหลักฐานในคลังนี้และไม่เดาคำตอบ", correct: true }, { text: "แต่งคำตอบที่ดูสมเหตุผล", correct: false }, { text: "ซ่อนว่าไม่มีแหล่งข้อมูล", correct: false }] },
    { type: "choice", title: "7. ครูต้องการให้ผู้ช่วยตอบคำถามจากคู่มือโรงเรียนที่มีข้อมูลนักเรียนบางส่วน สิ่งใดควรเกิดก่อน retrieval", help: "สถานการณ์", choices: [{ text: "ตรวจสิทธิ์การเข้าถึงเอกสารของผู้ใช้", correct: true }, { text: "ส่งเอกสารทุกฉบับให้ทุกคนเห็น", correct: false }, { text: "ลบ metadata ของเอกสาร", correct: false }] },
    { type: "choice", title: "8. similarity score สูงหมายความว่าอะไร", help: "เลือกหนึ่งข้อ", choices: [{ text: "ข้อความที่ค้นพบมีความใกล้กับคำถามตามวิธีจัดอันดับ", correct: true }, { text: "คำตอบถูกต้องแน่นอนเสมอ", correct: false }, { text: "เอกสารไม่มีอคติแน่นอน", correct: false }] },
    { type: "choice", title: "9. ฐานข้อมูลปกติมักเหมาะกับการเก็บข้อมูลใดในระบบ RAG", help: "เลือกหนึ่งข้อ", choices: [{ text: "เอกสาร metadata แหล่งที่มา และสิทธิ์การเข้าถึง", correct: true }, { text: "เฉพาะคำตอบที่ไม่มีแหล่งข้อมูล", correct: false }, { text: "รหัสผ่านของผู้ใช้ในข้อความธรรมดา", correct: false }] },
    { type: "choice", title: "10. ผู้ใช้ถามว่า ‘โรงเรียนควรใช้ AI หรือไม่’ แต่ไม่ได้บอกบริบท ผู้ช่วย RAG ที่ปลอดภัยควรทำอะไร", help: "สถานการณ์", choices: [{ text: "ขอให้ระบุประเด็น เช่น ข้อมูลส่วนตัว อคติ หรือการสอน", correct: true }, { text: "ตอบว่าใช้เสมอ", correct: false }, { text: "ตอบว่าไม่ใช้เสมอ", correct: false }] }
  ];
}

function postQuestions_() {
  return [
    { type: "choice", title: "1. คำตอบ RAG ที่ยึดหลักฐานควรใช้ข้อมูลใด", help: "เลือกหนึ่งข้อ", choices: [{ text: "chunk ที่ค้นพบจากคลังเอกสารที่อนุมัติแล้ว", correct: true }, { text: "ผลค้นเว็บที่ยังไม่ได้ตรวจสอบ", correct: false }, { text: "ประโยคที่ฟังดูสมเหตุผลแต่ไม่มีแหล่งข้อมูล", correct: false }] },
    { type: "choice", title: "2. ลำดับใดอธิบาย RAG ที่ปลอดภัยได้ดีที่สุด", help: "เลือกหนึ่งข้อ", choices: [{ text: "ค้นคืนหลักฐาน ตรวจสอบความเกี่ยวข้อง แล้วตอบพร้อมการอ้างอิง", correct: true }, { text: "ตอบก่อน แล้วค่อยหาแหล่งข้อมูลที่เข้ากัน", correct: false }, { text: "ใช้คำตอบเดิมกับทุกคำถาม", correct: false }] },
    { type: "choice", title: "3. การตั้งขนาด chunk ส่งผลต่อระบบอย่างไร", help: "เลือกหนึ่งข้อ", choices: [{ text: "ส่งผลต่อความละเอียดของข้อความที่ค้นพบและบริบทที่ส่งให้คำตอบ", correct: true }, { text: "ทำให้ไม่ต้องเก็บแหล่งที่มา", correct: false }, { text: "ทำให้ระบบไม่ต้องทดสอบ", correct: false }] },
    { type: "choice", title: "4. ผู้ใช้ถามคำว่า ‘คุ้มครองข้อมูลผู้เรียน’ แต่เอกสารใช้คำว่า ‘data privacy’ วิธีใดช่วยค้นหาความหมายที่เกี่ยวข้องได้ดี", help: "เลือกหนึ่งข้อ", choices: [{ text: "semantic retrieval ด้วย vector index", correct: true }, { text: "การค้นหาชื่อไฟล์แบบตรงกันเท่านั้น", correct: false }, { text: "การสร้างคำตอบโดยไม่ค้นหลักฐาน", correct: false }] },
    { type: "choice", title: "5. การค้นหาด้วย keyword เหมาะกับกรณีใดมากที่สุด", help: "เลือกหนึ่งข้อ", choices: [{ text: "ผู้ใช้ระบุรหัส นโยบาย หรือคำเฉพาะที่ปรากฏในเอกสาร", correct: true }, { text: "ผู้ใช้ต้องการค้นหาความหมายใกล้เคียงโดยไม่มีคำตรงกัน", correct: false }, { text: "ไม่มีเอกสารให้ค้นหา", correct: false }] },
    { type: "choice", title: "6. ข้อใดอธิบายบทบาทของ vector index ได้ถูกต้อง", help: "เลือกหนึ่งข้อ", choices: [{ text: "จัดอันดับ chunk ที่มีความหมายใกล้กับคำถาม", correct: true }, { text: "แทนที่การตรวจสิทธิ์ของผู้ใช้ทั้งหมด", correct: false }, { text: "ยืนยันว่าคำตอบถูกต้องโดยอัตโนมัติ", correct: false }] },
    { type: "choice", title: "7. ข้อใดอธิบายการออกแบบระบบ RAG ได้ถูกต้องที่สุด", help: "เลือกหนึ่งข้อ", choices: [{ text: "ฐานข้อมูลปกติเก็บเอกสาร metadata และสิทธิ์ ส่วน vector index ช่วยจัดอันดับข้อความที่มีความหมายใกล้เคียง ทั้งสองส่วนอาจอยู่ในระบบเดียวกันได้", correct: true }, { text: "vector database แทนที่ metadata และสิทธิ์ทั้งหมดได้เสมอ", correct: false }, { text: "ระบบ RAG ไม่จำเป็นต้องเก็บตำแหน่งของแหล่งข้อมูล", correct: false }] },
    { type: "choice", title: "8. เจ้าหน้าที่ถามผู้ช่วยเกี่ยวกับเอกสารภายใน แต่ผู้ช่วยไม่มีสิทธิ์เข้าถึงเอกสารนั้น ผู้ช่วยควรทำอะไร", help: "สถานการณ์", choices: [{ text: "แจ้งข้อจำกัดและไม่เปิดเผยเนื้อหา", correct: true }, { text: "เดาเนื้อหาเพื่อช่วยให้เร็วขึ้น", correct: false }, { text: "ใช้เอกสารของผู้ใช้อื่นแทน", correct: false }] },
    { type: "choice", title: "9. ผู้ใช้ถามว่า ‘โรงเรียนควรใช้ AI หรือไม่’ คำตอบที่ปลอดภัยที่สุดคืออะไร", help: "สถานการณ์", choices: [{ text: "ขอให้ผู้ใช้ระบุประเด็นที่ต้องการ เช่น ความเป็นส่วนตัว อคติ หรือการเรียนการสอน", correct: true }, { text: "ตอบว่าใช่เสมอ", correct: false }, { text: "ตอบว่าไม่เสมอโดยไม่อธิบาย", correct: false }] },
    { type: "choice", title: "10. ใน Lab Agent ภายหลัง เหตุใดหลัก retrieval จึงยังสำคัญ", help: "เลือกหนึ่งข้อ", choices: [{ text: "Agent ควรค้นนโยบาย เครื่องมือ หรือการอนุมัติที่เกี่ยวข้องก่อนวางแผนหรือดำเนินการ", correct: true }, { text: "Agent ควรทำทุกอย่างโดยไม่ตรวจบริบท", correct: false }, { text: "Agent ไม่ต้องมีขอบเขตเมื่อใช้เครื่องมือ", correct: false }] }
  ];
}
