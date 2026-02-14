"use client";

import { useState } from "react";
import { PlusCircle, ListChecks } from "lucide-react";
import CreateSubjectModal from "./CreateSubjectModal";
import ManageSubjectModal from "./ManageSubjectModal";

const SubjectPageClient = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [manageModalOpen, setManageModalOpen] = useState(false);

    return (
        <div className="min-h-[80vh] w-full flex flex-col items-center justify-center p-4 relative overflow-hidden mt-20 md:mt-0">
            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                            <PlusCircle className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">
                            Subject Management
                        </h1>
                        <p className="text-emerald-100">
                            Create, view, and manage academic subjects and their configurations
                        </p>
                    </div>

                    {/* Action Cards */}
                    <div className="p-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Create Button */}
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 hover:border-emerald-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                        <PlusCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                                        Create Subject
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        Add new subjects with grade, major, and type configurations.
                                        Create multiple subjects at once.
                                    </p>
                                </div>
                            </button>

                            {/* Manage Button */}
                            <button
                                onClick={() => setManageModalOpen(true)}
                                className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                                        <ListChecks className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                                        Manage Subjects
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        View all subjects, search and filter by name, edit
                                        configurations, or remove subjects.
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateSubjectModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />
            <ManageSubjectModal
                open={manageModalOpen}
                onOpenChange={setManageModalOpen}
            />
        </div>
    );
};

export default SubjectPageClient;
