import { db } from "@/db";
import { todos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { CheckSquare, Circle, CheckCircle2, Trash2 } from "lucide-react";
import { addTodo, toggleTodo, deleteTodo } from "./actions";
import { getSession } from "@/lib/auth";

// Form component with useActionState needs to be a client component, but listing can be server.
// To keep it simple and beautiful, I'll make the whole page client component or mixed.
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export default async function TodosPage() {
    const session = await getSession();

    let whereClause = undefined;
    if (session?.role !== "ADMIN") {
        whereClause = eq(todos.createdBy, session?.name || session?.username || "");
    }

    const allTodos = await db.query.todos.findMany({
        where: whereClause,
        orderBy: [desc(todos.createdAt)],
    });

    const uncompleted = allTodos.filter(t => !t.isCompleted);
    const completed = allTodos.filter(t => t.isCompleted);

    return (
        <div className="space-y-6">
            <div className="glass-card p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                        <CheckSquare className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Yapılacaklar Listesi</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Şirket içi görev takibini ve acil işleri buradan yönetin.</p>
                    </div>
                </div>

                <TodoForm />
            </div>

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Bekleyen Görevler ({uncompleted.length})</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {uncompleted.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Tüm görevler tamamlandı! Harika iş çıkardınız. 🎉</div>
                    ) : (
                        uncompleted.map(todo => <TodoItem key={todo.id} todo={todo} />)
                    )}
                </div>
            </div>

            {completed.length > 0 && (
                <div className="glass-card overflow-hidden opacity-70">
                    <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 backdrop-blur-sm">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Tamamlanan Görevler ({completed.length})</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                        {completed.map(todo => <TodoItem key={todo.id} todo={todo} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
