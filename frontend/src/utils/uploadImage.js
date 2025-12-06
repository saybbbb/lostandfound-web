import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ulaf_upload"); // your preset

  try {
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/desahedtt/image/upload",
      data
    );

    return res.data.secure_url;
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    return null;
  }
};
