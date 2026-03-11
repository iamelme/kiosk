import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

type ReturnType = {
  handleUploadDb: () => void;
  error: Error | string;
};

export default function useUploadBackup(): ReturnType {
  const [error, setError] = useState<Error | string>("");

  const queryClient = useQueryClient();

  const handleUploadDb = async () => {
    try {
      setError("");
      const res = await window.apiSettings.uploadBackUp();

      if (res === false) {
        throw new Error("Something went wrong while uploading the database.");
      }

      if (res !== undefined) {
        await queryClient.invalidateQueries({ queryKey: ["info"] });
        toast("Successfully replace a database");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(error);
      }
    }
  };

  return { handleUploadDb, error };
}
