import express, { Request, Response } from "express";
import pm2 from "pm2";
import cors from "cors";

const app = express();
const port = 9999; // Use a porta 9999 conforme mencionado no seu frontend

app.use(express.json());
app.use(cors());

app.get("/api/processes", (req: Request, res: Response) => {
  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);

      return;
    }

    pm2.list((err, list) => {
      pm2.disconnect();
      if (err) {
        console.error(err);
        res.status(500).send(err);

        return;
      }

      res.json(list);
    });
  });
});

app.post("/api/processes/:id/stop", (req: Request, res: Response) => {
  const { id } = req.params;

  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);

      return;
    }

    pm2.stop(Number(id), (err) => {
      pm2.disconnect();
      if (err) {
        console.error(err);
        res.status(500).send(err);

        return;
      }

      res.send({ success: true });
    });
  });
});

app.post("/api/processes/:id/restart", (req: Request, res: Response) => {
  const { id } = req.params;

  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);

      return;
    }

    pm2.restart(Number(id), (err) => {
      pm2.disconnect();
      if (err) {
        console.error(err);
        res.status(500).send(err);

        return;
      }

      res.send({ success: true });
    });
  });
});

app.post("/api/processes/:id/start", (req: Request, res: Response) => {
  const { id } = req.params;

  pm2.connect((err) => {
    if (err) {
      console.error(err);
      res.status(500).send(err);

      return;
    }

    pm2.restart(Number(id), (err) => {
      pm2.disconnect();
      if (err) {
        console.error(err);
        res.status(500).send(err);

        return;
      }

      res.send({ success: true });
    });
  });
});

app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
