import express, { Request, Response } from "express";
require("dotenv").config();
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles, requireAuth } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  app.get(
    "/filteredimage",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const { image_url } = req.query;
        if (!image_url) {
          res.status(400).send({ message: "image_url is required" });
        }
        const filePath: string = await filterImageFromURL(image_url);
        res.sendFile(filePath, () => deleteLocalFiles([filePath]));
      } catch (error) {
        console.log(error)
        res.status(500).send({ message: error });
      }
    }
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
