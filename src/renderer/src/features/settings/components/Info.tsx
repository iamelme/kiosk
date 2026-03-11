import Alert from "@renderer/shared/components/ui/Alert";
import { humanize } from "@renderer/shared/utils";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";

export default function Info(): ReactNode {
  const { data, error } = useQuery({
    queryKey: ["info"],
    queryFn: async () => {
      const { data, error } = await window.apiSettings.getBackuplogs();
      console.log({ data, error });

      return data;
    },
  });
  console.log("bottom", { data, error });

  if (!data) {
    return (
      <Alert variant="info" className="mb-3">
        No information to display yet
      </Alert>
    );
  }

  return (
    <>
      <h3 className="font-medium text-lg mb-3">Database Information</h3>

      <div className="flex flex-col gap-y-3 mb-5">
        <dl className="grid grid-cols-7 gap-x-5 pb-3 border-b border-slate-200">
          <dt className="col-span-3 text-slate-400">Date</dt>
          <dd className="col-span-4">
            {new Date(data?.created_at).toLocaleDateString()}{" "}
            {new Date(data?.created_at).toLocaleTimeString()}
          </dd>
        </dl>

        <dl className="grid grid-cols-7 gap-x-5 pb-3  border-slate-200">
          <dt className="col-span-3 text-slate-400">Status</dt>
          <dd>{data?.status ? humanize(data?.status) : ""}</dd>
        </dl>
      </div>
    </>
  );
}
