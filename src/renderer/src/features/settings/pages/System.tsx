import { ReactNode } from "react";
// import FormWrapper from "@renderer/shared/components/form/FormWrapper";
// import SystemForm from "../components/SystemForm";
// import z from "zod";
import { useQuery } from "@tanstack/react-query";
// import { SettingsType } from "../utils/type";
// import { useNavigate } from "react-router-dom";
import Alert from "@renderer/shared/components/ui/Alert";
import Button from "@renderer/shared/components/ui/Button";
import { Download } from "react-feather";

// const schema = z.object({
// });

// type ValuesType = z.infer<typeof schema>;

export default function System(): ReactNode {
  // const navigate = useNavigate();
  //
  // const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await window.apiSettings.getSettings();

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      return data;
    },
  });

  // const mutation = useMutation({
  //   mutationFn: async (data: Partial<SettingsType>) => {
  //     const { error } = await window.apiSettings.update(data);
  //     if (error instanceof Error) {
  //       throw new Error(error.message);
  //     }
  //   },
  //   onSuccess: () => {
  //     navigate(-1);
  //     queryClient.invalidateQueries({ queryKey: ["settings"] });
  //   },
  // });
  //
  if (isPending) {
    return <>Loading...</>;
  }

  if (error || !data) {
    return (
      <Alert variant="danger">
        {error?.message || "Something wen't wrong"}
      </Alert>
    );
  }

  return (
    <>
      <div className="grid grid-cols-7 gap-x-5">
        <div className="col-span-3">
          <h3 className="font-medium">Database Backup</h3>
          <p className="text-xs text-slate-500">
            It is important to frequently backup your database. <br />
            <em>Tip</em>: it is recommended to store it in your Online storage
            e.g(Google Drive, Dropbox, etc...)
          </p>
        </div>
        <div className="col-span-4">
          <Button onClick={() => window.apiSettings.addBackUp()}>
            <Download size={14} /> Backup Database
          </Button>
        </div>
      </div>
    </>
  );
}
