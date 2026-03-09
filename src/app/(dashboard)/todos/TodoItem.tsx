"use client";

import { useTransition } from "react";
import { CheckSquare, Square, Trash2, Clock } from "lucide-react";
import { toggleTodo, deleteTodo } from "./actions";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function TodoItem({ todo }: { todo: any }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(() => {
            toggleTodo(todo.id, todo.isCompleted);
        });
    };

    const handleDelete = () => {
        if (confirm("Bu görevi silmek istediğinize emin misiniz?")) {
            startTransition(() => {
                deleteTodo(todo.id);
            });
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case "ÇOK ACİL":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">🔴 ÇOK ACİL</span>;
            case "ACİL":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">🟠 ACİL</span>;
            case "NORMAL":
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-500/30">🟢 NORMAL</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-500/20 text-gray-400 border border-gray-500/30">🟢 NORMAL</span>;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case "ÇOK ACİL":
                return "rgb(239 68 68)"; // red-500
            case "ACİL":
                return "rgb(249 115 22)"; // orange-500
            default:
                return "rgb(34 197 94)"; // green-500
        }
    };

    const isCompleted = todo.isCompleted;

    return (
        <div
            className={`p-4 flex items-start gap-4 transition-all duration-300 border-l-[3px] ${isCompleted
                    ? "bg-gray-50 dark:bg-black/20 border-l-transparent opacity-60"
                    : "bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm dark:shadow-lg dark:shadow-black/20"
                }`}
            style={{
                borderLeftColor: isCompleted ? "transparent" : getUrgencyColor(todo.urgency),
            }}
        >
            <button
                onClick={handleToggle}
                disabled={isPending}
                className="mt-1 flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            >
                {todo.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-500" />
                ) : (
                    <Square className="w-5 h-5" />
                )}
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className={`text-sm font-medium ${todo.isCompleted ? "text-gray-500 line-through" : "text-gray-900 dark:text-gray-200"}`}>
                        {todo.task}
                    </p>
                    {!todo.isCompleted && getUrgencyBadge(todo.urgency)}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-600 dark:text-gray-400">{todo.createdBy}</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(todo.createdAt), "dd MMM HH:mm", { locale: tr })}
                    </span>
                </div>
            </div>

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-gray-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
