# Retrieval first principles / หลักการพื้นฐานของ Retrieval

## The foundational question / คำถามตั้งต้น

Before a system answers, ask: **Which approved evidence is relevant enough to inspect?** That act of selecting evidence is retrieval.

ก่อนระบบจะตอบ ให้ถามว่า **หลักฐานที่อนุมัติชิ้นใดเกี่ยวข้องพอที่จะตรวจสอบ** การคัดเลือกหลักฐานนี้คือ retrieval

Retrieval does not mean semantic search alone. A system can retrieve by an exact ID, a database filter, a keyword index, a vector similarity index, or a tool call that returns approved records. Semantic vector search helps when wording differs but meaning is related.

Retrieval ไม่ได้หมายถึง semantic search เท่านั้น ระบบอาจค้นคืนด้วย ID ที่ตรงกัน ตัวกรองฐานข้อมูล ดัชนีคำสำคัญ ดัชนี vector similarity หรือเครื่องมือที่คืนข้อมูลที่อนุมัติแล้ว Semantic vector search ช่วยเมื่อตัวคำต่างกันแต่ความหมายใกล้เคียง

## The lab's system / ระบบใน Lab

`approved documents -> chunks with metadata -> retrieval strategy -> selected evidence -> bounded answer with citations`

`เอกสารที่อนุมัติ -> chunks พร้อม metadata -> กลยุทธ์ retrieval -> หลักฐานที่เลือก -> คำตอบที่มีขอบเขตและการอ้างอิง`

The starter uses two deliberately simple stores:

| Need | Lab implementation | Production choice |
| --- | --- | --- |
| Keep documents, titles, URLs, permissions, and chunk metadata | Local JSON document store | Postgres or another normal database |
| Find exact words | Token matching over the local text | Full-text index such as Postgres FTS |
| Find related meaning | Precomputed local vectors | `pgvector`, Chroma, Pinecone, or another vector index |

A normal database and a vector index often belong in the same system. For a small corpus, Postgres plus `pgvector` can hold both metadata and vectors. Do not add a separate vector database only because a tutorial does.

## Why this matters for agents / เหตุผลที่สำคัญต่อ Agent

An agent should retrieve trusted records before it plans or acts. Later labs can replace “retrieve source chunks” with “retrieve available tools, policies, or approval records,” while preserving the same boundary: inspect approved context, then make a bounded next step.

