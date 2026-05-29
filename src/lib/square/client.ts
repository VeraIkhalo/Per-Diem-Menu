import { SquareClient, SquareEnvironment } from "square";

let client: SquareClient | undefined;

export function getSquareClient(): SquareClient {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "SQUARE_ACCESS_TOKEN is not set. Copy .env.example to .env and add your sandbox token.",
    );
  }

  if (!client) {
    const environment =
      process.env.SQUARE_ENVIRONMENT === "production"
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox;

    client = new SquareClient({
      token,
      environment,
    });
  }

  return client;
}
