const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Activity = require("../models/activity.model");
const Category = require("../models/category.model");
const { authMiddleware } = require("../middlewares/auth.middleware");

// router.post("/", authMiddleware, async (req, res) => {
//   if (!req.body.categoryId || !req.body.title) {
//     return res.status(400).send("category or title is required");
//   }

//   try {
//     const userId = req.user.id;
//     const eventId = uuidv4();
//     const uniqueUrl = `http://localhost:5000/activity/${eventId}`;
//     let activity;

//     activity = await Activity.create({
//       uniqueUrl: uniqueUrl,
//       categoryId: req.body.categoryId,
//       title: req.body.title,
//       description: req.body.description,
//       isPrivate: req.body.isPrivate,
//       expirationDate: req.body.expirationDate,
//       imageUrl: req.body.imageUrl,
//       counter: req.body.counter,
//       parah: req.body.parah,
//       createdBy: userId,
//       status: "RUNNING",
//     });

//     activity.uniqueUrl = `${uniqueUrl}/${activity._id}`;
//     await activity.save();

//     activity = await activity.populate("createdBy", "categoryId");

//     return res.status(200).json({
//       success: true,
//       message: "Activity Created Successfully!",
//       data: { activity, userId },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

router.post("/", authMiddleware, async (req, res) => {
  if (!req.body.categoryId || !req.body.title) {
    return res.status(400).send("category or title is required");
  }

  try {
    const userId = req.user.id;
    const eventId = uuidv4();
    const uniqueUrl = `http://localhost:5000/activity/${eventId}`;
    let activity;

    // Check if categoryId and name match a category with the name "QURAN_KHWANI"
    const category = await Category.findOne({
      _id: req.body.categoryId,
      name: "QURAN_KHWANI",
    });
    const parah = category ? Array.from({ length: 30 }, (_, i) => i + 1) : null;

    activity = await Activity.create({
      uniqueUrl: uniqueUrl,
      categoryId: req.body.categoryId,
      title: req.body.title,
      description: req.body.description,
      isPrivate: req.body.isPrivate,
      expirationDate: req.body.expirationDate,
      imageUrl: req.body.imageUrl,
      counter: req.body.counter,
      parah: parah,
      createdBy: userId,
      status: "RUNNING",
    });

    activity.uniqueUrl = `${uniqueUrl}/${activity._id}`;
    await activity.save();

    activity = await activity.populate("createdBy", "categoryId");

    return res.status(200).json(activity);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/user-activity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({
      createdBy: userId,
      status: { $in: ["RUNNING", "PAUSED"] },
    }).populate("createdBy", "categoryId");

    return res.status(200).json({
      success: true,
      message: "User Activity Retrieved Successfully!",
      data: { activities },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/id/:id", async (req, res) => {
  try {
    console.log("id:", req.params.id);

    const activity = await Activity.findById({
      _id: req.params.id,
    }).populate("createdBy", "categoryId");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Activity found!",
      data: { activity },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/join/:id", authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    console.log(userId);

    const activity = await Activity.findById(eventId).populate("members");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (activity.members.find((member) => member.userId === userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of the event",
      });
    }

    activity.members.push({
      userId,
    });
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "User joined the activity successfully",
      data: {
        activity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/wazaif/:id", async (req, res) => {
  try {
    const activityId = req.params.id;
    const { counter, imageUrl } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const category = await Category.findById(activity.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.name !== "WAZAIF") {
      return res.status(400).json({
        success: false,
        message: "Category name does not match",
      });
    }

    activity.counter = counter;
    activity.imageUrl = imageUrl;

    const updatedActivity = await activity.save();

    return res.status(200).json({
      success: true,
      message: "Counter updated successfully",
      data: {
        activity: updatedActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/quran-khwani/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.id;
    const { parah } = req.body;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const category = await Category.findById(activity.categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (category.name !== "QURAN_KHWANI") {
      return res.status(400).json({
        success: false,
        message: "Category name does not match",
      });
    }

    // const parahIndex = activity.parah.indexOf(parah);
    // if (parahIndex === -1) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Parah number is not available",
    //   });
    // }

    let userFound = false;

    for (const member of activity.members) {
      if (member.userId.equals(userId)) {
        member.parah = parah;
        member.status = "READING";
        userFound = true;
        break;
      }
    }

    const updatedActivity = await activity.save();

    return res.status(200).json({
      success: true,
      message: "Parah updated successfully",
      data: {
        activity: updatedActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/leave/:id", authMiddleware, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user._id;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const memberIndex = activity.members.findIndex((member) =>
      member.userId.equals(userId)
    );

    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of the activity",
      });
    }

    activity.members.splice(memberIndex, 1);

    await activity.save();

    return res.status(200).json({
      success: true,
      message: "User left the activity successfully",
      data: {
        activity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/stop/:id", authMiddleware, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (!activity.createdBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the creator can stop the activity",
      });
    }

    activity.status = "STOPPED";

    const updatedActivity = await activity.save();

    return res.status(200).json({
      success: true,
      message: "Activity stopped successfully",
      data: {
        activity: updatedActivity,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// router.get("/id/:id", authMiddleware, async (req, res) => {
//   try {
//     const activityId = req.params.id;
//     const userId = req.user.id;

//     const activity = await Activity.findById(activityId).populate(
//       "createdBy",
//       "categoryId"
//     );

//     if (!activity) {
//       return res.status(404).json({
//         success: false,
//         message: "Activity not found",
//       });
//     }

//     if (activity.createdBy.id !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to access this activity",
//       });
//     }

//     if (activity.createdBy.id === userId) {
//       return res.status(200).json({
//         success: false,
//         message: "Activity found!",
//         data: { activity },
//       });
//     }

//     if (activity.status === "STOPPED") {
//       return res.status(403).json({
//         success: false,
//         message: "Activity is stopped and inaccessible",
//       });
//     }

//     // Only the current user can see the activity if its status is not "STOPPED"
//     return res.status(200).json({
//       success: true,
//       message: "Activity found!",
//       data: { activity },
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

router.put("/pause/:id", authMiddleware, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId).populate(
      "createdBy",
      "categoryId"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (activity.createdBy.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    if (activity.status === "STOPPED") {
      return res.status(403).json({
        success: false,
        message: "Activity is already stopped",
      });
    }

    if (activity.status === "PAUSED") {
      return res.status(400).json({
        success: false,
        message: "Activity is already paused",
      });
    }

    activity.status = "PAUSED";
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Activity paused successfully",
      data: { activity },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/unpause/:id", authMiddleware, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user.id;

    const activity = await Activity.findById(activityId).populate(
      "createdBy",
      "categoryId"
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    if (activity.createdBy.id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action",
      });
    }

    // if (activity.status === "STOPPED") {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Activity stopped",
    //   });
    // }

    if (activity.status !== "PAUSED") {
      return res.status(400).json({
        success: false,
        message: "Activity is not paused",
      });
    }

    activity.status = "RUNNING";
    await activity.save();

    return res.status(200).json({
      success: true,
      message: "Activity unpaused successfully",
      data: { activity },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/archived", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({
      createdBy: userId,
      status: "STOPPED",
    }).populate("createdBy", "categoryId");

    return res.status(200).json({
      success: true,
      message: "User Activity Retrieved Successfully!",
      data: { activities },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/members/:id", async (req, res) => {
  try {
    const activityId = req.params.id;

    const activity = await Activity.findById(activityId).populate("members");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    const members = activity.members.map((member) => {
      return {
        _id: member._id,
        name: member.name,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Members retrieved successfully",
      data: {
        members: members,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put(
  "/quran-khwani/update-status/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const activityId = req.params.id;
      const { action } = req.body;

      const activity = await Activity.findById(activityId);

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: "Activity not found",
        });
      }

      const category = await Category.findById(activity.categoryId);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (category.name !== "QURAN_KHWANI") {
        return res.status(400).json({
          success: false,
          message: "Category name does not match",
        });
      }

      let userFound = false;

      for (const member of activity.members) {
        if (member.userId.equals(userId)) {
          if (action === "finished") {
            member.status = "FINISHED";
            userFound = true;
            break;
          } else if (action === "pause") {
            member.status = "PAUSED";
            userFound = true;
            break;
          }
        }
      }

      if (!userFound) {
        return res.status(400).json({
          success: false,
          message: "User does not have a parah",
        });
      }

      const updatedActivity = await activity.save();

      return res.status(200).json({
        success: true,
        message: `User status updated to ${action.toUpperCase()}`,
        data: {
          activity: updatedActivity,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = router;
