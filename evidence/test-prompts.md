# Required test prompts / คำถามทดสอบที่ต้องใช้

Run each prompt in the app. Record the status, source card, similarity score, and screenshot in your evidence log.

| Type | Prompt | Expected behaviour |
| --- | --- | --- |
| Answerable / ตอบได้ | `How should a school protect learner data when using GenAI?` | `grounded`, citation to **Protecting learner data** |
| Unsupported / ไม่มีหลักฐาน | `What is the CAMT tuition fee for next semester?` | `not_found`, no citation, no invented answer |
| Ambiguous / กำกวม | `Should schools use AI?` | `ambiguous`, asks for a focused concern |

Thai answerable alternative / คำถามภาษาไทย: `โรงเรียนควรคุ้มครองข้อมูลผู้เรียนอย่างไรเมื่อใช้ GenAI?`

