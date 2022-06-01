import { config } from "./../../../../config/config";
import { Router, Request, Response } from "express";
import { FeedItem } from "../models/FeedItem";
import { requireAuth } from "../../users/routes/auth.router";
import * as AWS from "../../../../aws";
import axios from "axios";
import { deleteLocalFiles, saveImage } from "../../../../util/util";

const router: Router = Router();

// Get all feed items
router.get("/", async (req: Request, res: Response) => {
  const items = await FeedItem.findAndCountAll({ order: [["id", "DESC"]] });
  items.rows.map((item) => {
    if (item.url) {
      item.url = AWS.getGetSignedUrl(item.url);
    }
  });
  res.send(items);
});

//@TODO
//Add an endpoint to GET a specific resource by Primary Key
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).send({ message: "id is required" });
  }

  const item = await FeedItem.findByPk(id);
  if (!item) {
    res.status(404).send({ message: "item not found" });
  }
  res.status(200).send(item);
});

// update a specific resource
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  //@TODO try it yourself
  res.status(500).send("not implemented");
});

// Get a signed url to put a new item in the bucket
router.get(
  "/signed-url/:fileName",
  requireAuth,
  async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({ url: url });
  }
);

// Post meta data and the filename after a file is uploaded
// NOTE the file name is they key name in the s3 bucket.
// body : {caption: string, fileName: string};
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const caption = req.body.caption;
  const fileName = req.body.url;

  // check Caption is valid
  if (!caption) {
    return res
      .status(400)
      .send({ message: "Caption is required or malformed" });
  }

  // check Filename is valid
  if (!fileName) {
    return res.status(400).send({ message: "File url is required" });
  }

  const item = await new FeedItem({
    caption: caption,
    url: fileName,
  });

  const saved_item = await item.save();

  saved_item.url = AWS.getGetSignedUrl(saved_item.url);
  res.status(201).send(saved_item);
});

router.post(
  "/filteredimage/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).send({ message: "id is required" });
    }

    const item = await FeedItem.findByPk(id);
    if (!item) {
      res.status(404).send({ message: "feed item is not found" });
    }

    const signedUrl = AWS.getGetSignedUrl(item.url);
    console.log("Signed url: " + signedUrl);

    const url = config.image_processing.url + `/filteredimage`;

    try {
      const imageResponse = await axios.get(url, {
        headers: {
          authorization: "Bearer " + config.image_processing.token,
        },
        params: {
          image_url: signedUrl,
        },
        responseType: "arraybuffer"
      });

      if (imageResponse.status != 200) {
        res.status(500).send({ message: imageResponse.statusText });
      }

      const filePath = await saveImage(Buffer.from(imageResponse.data));
      res.sendFile(filePath, () => deleteLocalFiles([filePath]));
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

export const FeedRouter: Router = router;
