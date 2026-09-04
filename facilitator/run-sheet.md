# Lab 1 run sheet / แผนดำเนินกิจกรรม Lab 1

## Learning outcome / ผลลัพธ์การเรียนรู้

Learners ship `rag-v1`: a browser assistant that retrieves only from an approved corpus, presents inspectable citations, and declines unsupported claims.

ผู้เรียนส่ง `rag-v1`: ผู้ช่วยบนเบราว์เซอร์ที่ค้นจากคลังที่อนุมัติ แสดงการอ้างอิงที่ตรวจสอบได้ และปฏิเสธข้ออ้างที่ไม่มีหลักฐาน

| Time | Mode | Facilitator action / การดำเนินการ |
| --- | --- | --- |
| 00:00-00:10 | Verify | Share pretest; confirm anonymous learner code. / ส่ง pretest และยืนยันรหัสผู้เรียน |
| 00:10-00:25 | Learn | Use the launch slide and explain retrieval as selecting approved evidence. Contrast direct lookup, keyword search, and vector search. / ใช้สไลด์เริ่มต้นและอธิบาย retrieval ว่าเป็นการเลือกหลักฐานที่อนุมัติ เปรียบเทียบ direct lookup การค้นคำ และ vector search |
| 00:25-01:15 | Learn | Run Colab: inspect long documents, chunk them, use keyword retrieval, then embed or load fallback vectors. / รัน Colab: ตรวจเอกสารที่ยาว แบ่งข้อความ ใช้ keyword retrieval แล้วทำ embedding หรือโหลด fallback vectors |
| 01:15-01:30 | Learn | Inspect source cards and similarity scores; explain the evidence boundary. / ตรวจ source card และคะแนน similarity |
| 01:30-01:45 | Verify | Break; ensure every learner has the starter open. / พักและตรวจว่าเปิด starter แล้ว |
| 01:45-02:30 | Learn | Inspect the document store, vector index, `AnswerResult`, status, and citation objects. Discuss when a normal database, full-text index, and vector index belong together. / ตรวจ document store, vector index, `AnswerResult`, สถานะ และ citation object พร้อมอภิปรายการใช้ normal database, full-text index และ vector index |
| 02:30-03:10 | Build | Build the chat, source drawer, answer status, and library screen. / สร้าง chat, source drawer, สถานะคำตอบ และหน้าคลังเอกสาร |
| 03:10-03:30 | Verify | Run answerable, unsupported, and ambiguous tests; complete evidence log. / ทดสอบคำถามสามแบบและบันทึกหลักฐาน |
| 03:30-03:40 | Verify | Share posttest. / ส่ง posttest |
| 03:40-04:00 | Verify | Commit `rag-v1`, capture screenshots, and submit. / commit `rag-v1` ถ่ายภาพ และส่งงาน |

## Decision rule / เกณฑ์ตัดสิน

Evidence beats polish. A polished interface without retrieved evidence, inspectable citations, and a safe failure is not complete.

หลักฐานสำคัญกว่าความสวยงามของหน้าจอ หากไม่มีหลักฐานที่ค้นพบ การอ้างอิงที่ตรวจสอบได้ และการปฏิเสธอย่างปลอดภัย งานยังไม่สมบูรณ์
