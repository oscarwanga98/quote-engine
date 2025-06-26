export const validateRequest = (req) => {
  if (!req.body.imageUrl) {
    return { error: "imageUrl is required" };
  }
  return null;
};
