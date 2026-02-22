export const getErrorMessage = async (error: any) => {
  if (!error) return null;

  let data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      data = JSON.parse(text);
    } catch (_) {
      return "Gagal membaca pesan error dari file.";
    }
  }

  if (data?.message === "Validation failed") {
    return data.errors[0]?.message || "Validation error";
  }

  return data?.message || error.message || "Something went wrong.";
};
