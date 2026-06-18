const useUploadFile = () => {
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kategori", "foto_bank_sampah");

    try {
      const response = await fetch("/api/fileUpload", {
        headers: {
          contentType: "multipart/form-data",
        },
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      /// mengembalikan url path file
      return data.data[0].path;
    } catch (error) {
      console.log("useUploadFile error", error);
      throw error;
    }
  };

  return { uploadFile };
};

export default useUploadFile;
