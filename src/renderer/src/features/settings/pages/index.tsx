import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Database, Monitor } from "react-feather";
import SettingsNav from "../components/SettingsNav";

const menu = [
  {
    label: "General",
    to: ".",
    icon: <Monitor size={14} />,
  },
  {
    label: "System",
    to: "system",
    icon: <Database size={14} />,
  },
];

export default function SettingsPage(): ReactNode {
  return (
    <div className="flex flex-col h-[100svh] py-4">
      <header className="shrink-0 mb-5">
        <h2 className="text-xl">Settings</h2>
        <p className="text-slate-400">Configure the app to your likes</p>
        <SettingsNav items={menu} />
      </header>

      <div className="flex-1 overflow-x-hidden overflow-y-auto py-2">
        <Outlet />
      </div>
    </div>
  );
}
