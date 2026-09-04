---
id: data-privacy
title_en: Protecting learner data
title_th: การคุ้มครองข้อมูลของผู้เรียน
source_title: Guidance for generative AI in education and research
source_url: https://unesdoc.unesco.org/ark:/48223/pf0000386693
source_locator: Chapter 4, data protection recommendations
source_page: 24
license: CC BY-SA 3.0 IGO
chunk_id: data-privacy-01
---

## English source extract

Education providers should tell learners what data a GenAI system may collect, how it may use those data, and how this may affect their education and wider lives. Privacy and data protection are not optional product details.

Before a class adopts a tool, the instructor should identify the data path. Ask which prompt text, files, account details, device information, and interaction history the tool receives. Ask who can access those data, how long the provider retains them, and whether the data improve a public model. Learners need a plain-language explanation before they decide what to submit.

The RAG lab uses a deliberately non-sensitive corpus so learners can focus on retrieval rather than handle personal records. The product does not require a login or an API key. Its evidence log uses an anonymous code rather than a name. In a production knowledge assistant, permission checks should occur before retrieval so one user's query cannot reveal another person's documents.

## คำแปลภาษาไทย

ผู้ให้บริการการศึกษาควรแจ้งผู้เรียนว่า GenAI อาจเก็บข้อมูลใด ใช้ข้อมูลอย่างไร และอาจส่งผลต่อการศึกษาและชีวิตของผู้เรียนอย่างไร ความเป็นส่วนตัวและการคุ้มครองข้อมูลไม่ใช่รายละเอียดเล็กน้อยของผลิตภัณฑ์

ก่อนนำเครื่องมือมาใช้ในชั้นเรียน ผู้สอนควรระบุเส้นทางข้อมูล ตรวจว่าระบบได้รับข้อความ prompt ไฟล์ รายละเอียดบัญชี ข้อมูลอุปกรณ์ และประวัติการใช้งานใดบ้าง ใครเข้าถึงข้อมูลได้ ผู้ให้บริการเก็บไว้นานเท่าใด และข้อมูลจะใช้ปรับปรุงโมเดลสาธารณะหรือไม่ ผู้เรียนต้องได้รับคำอธิบายที่ชัดเจนก่อนตัดสินใจส่งข้อมูล

Lab RAG ใช้คลังข้อมูลที่ไม่ละเอียดอ่อนโดยตั้งใจ ผลิตภัณฑ์ไม่ต้อง login หรือ API key และ evidence log ใช้รหัสนิรนาม แทนชื่อ ในระบบจริงควรตรวจสิทธิ์ก่อน retrieval เพื่อไม่ให้คำถามของผู้ใช้คนหนึ่งเปิดเผยเอกสารของอีกคน
