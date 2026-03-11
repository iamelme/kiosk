import Button from "@renderer/shared/components/ui/Button";
import { ReactNode } from "react";
import { Download } from "react-feather";

export default function DownloadBackup(): ReactNode {
  return (
    <div className="flex flex-col gap-y-4">
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
          <Button onClick={async () => window.apiSettings.addBackUp()}>
            <Download size={14} /> Backup Database
          </Button>
        </div>
      </div>
    </div>
  );
}
