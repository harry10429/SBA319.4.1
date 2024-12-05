import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/conn.mjs";

const router = express.Router();
//create class_index
async function createClassIndex() {
  const collection = await db.collection("grades");
  const classIndex = await collection.createIndex({ class_id: 1 });
  console.log(`index ${classIndex} is created`);
}

const classIndex = createClassIndex();
//create learner_index
async function createLearnerIndex() {
  const collection = await db.collection("grades");
  const classIndex = await collection.createIndex({ student_id: 1 });
  console.log(`index ${classIndex} is created`);
}

const learnerIndex = createLearnerIndex();

router.post("/", async (req, res) => {
  let collection = await db.collection("grades");

  let newDocument = req.body;

  console.log(newDocument);

  let result = await collection.insertOne(newDocument);
  if (!result) res.send("not created").status(500);
  else res.send(result).status(201);
});

router.get("/", async (req, res) => {
  let collection = await db.collection("grades");

  let results = await collection.find({}).limit(50).toArray();

  if (!results) res.send("not found").status(404);
  else res.send(results).status(200);
});

//count total students number/ numbers of student above 70% exam average / percentage in totalstudent
router.get("/stats", async (req, res) => {
  try {
    const collection = await db.collection("grades");

    const pipeline = [
      {
        $unwind: "$scores",
      },
      {
        $match: {
          "scores.type": "exam",
        },
      },
      {
        $group: {
          _id: "$student_id",
          averageExamScore: { $avg: "$scores.score" },
        },
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          studentsAbove70: {
            $sum: {
              $cond: [{ $gt: ["$averageExamScore", 70] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalStudents: 1,
          studentsAbove70: 1,
          percentageAbove70: {
            $multiply: [
              { $divide: ["$studentsAbove70", "$totalStudents"] },
              100,
            ],
          },
        },
      },
    ];
    const stat = await collection.aggregate(pipeline).toArray();
    res.json(
      stat[0] || {
        totalStudents: 0,
        studentsAbove70: 0,
        percentageAbove70: 0,
      }
    );
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).send("Internal Server Error");
  }
});

//same as above but for specific class_id using match
router.get("/stats/:id", async (req, res) => {
  const id = req.params.id;
  const collection = await db.collection("grades");

  const pipeline = [
    {
      $match: {
        class_id: id,
      },
    },
    {
      $unwind: "$scores",
    },
    {
      $match: {
        "scores.type": "exam",
      },
    },
    {
      $group: {
        _id: "$student_id",
        averageExamScore: { $avg: "$scores.score" },
      },
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        studentsAbove70: {
          $sum: {
            $cond: [{ $gt: ["$averageExamScore", 70] }, 1, 0],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalStudents: 1,
        studentsAbove70: 1,
        percentageAbove70: {
          $multiply: [{ $divide: ["$studentsAbove70", "$totalStudents"] }, 100],
        },
      },
    },
  ];
  const stat = await collection.aggregate(pipeline).toArray();
  res.json(
    stat[0] || {
      totalStudents: 0,
      studentsAbove70: 0,
      percentageAbove70: 0,
    }
  );
});

router.get("/:id", async (req, res) => {
  let collection = await db.collection("grades");

  let query;
  try {
    query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("not found").status(404);
    else res.send(result).status(200);
  } catch (err) {
    res.send("not an id").status(400);
  }
  // console.log(query)
});
router.get("/stats", (req, res) => {});
router.get("/stats/:id", async (req, res) => {
  let collection = await db.collection("grade");

  let query = { class_id: Number(req.params.id) };
  let result = await collection.find(query);
});

router.get("/student/:student_id", async (req, res) => {
  let collection = await db.collection("grades");

  let query = { student_id: Number(req.params.student_id) };
  console.log(query);

  let results = await collection.find(query).toArray();

  if (!results) res.send("not found").status(404);
  else res.send(results).status(200);
});

router.delete("/:id", async (req, res) => {
  let collection = await db.collection("grades");

  let query = { _id: new ObjectId(req.params.id) };

  let results = await collection.deleteOne(query);

  if (!results) res.send("not found").status(404);
  res.send(results).status(200);
});

export default router;
