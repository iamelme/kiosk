import { ReactNode } from "react";
import Alert from "@renderer/shared/components/ui/Alert";
import Button from "@renderer/shared/components/ui/Button";
import { Upload } from "react-feather";

type Props = {
  error?: string;
  onHandleUploadDb: () => void;
};

export default function UploadBackup({
  error,
  onHandleUploadDb,
}: Props): ReactNode {
  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-7 gap-x-5">
        <div className="col-span-3">
          <h3 className="font-medium">Database Upload</h3>
          <p className="text-xs text-slate-500">
            Always download a backup of your database first before doing
            database upload.
          </p>
        </div>
        <div className="col-span-4">
          <Button variant="outline" onClick={onHandleUploadDb}>
            <Upload size={14} />
            Upload Database
          </Button>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
