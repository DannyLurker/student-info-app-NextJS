"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const grades = ["tenth", "eleventh", "twelfth"];
const majors = ["softwareEngineering", "accounting"];
const classNumbers = [1, 2, 3, 4];
const teachers = ["Pak Budi", "Bu Sari", "Pak Joko"];

const CreateStudentAccount = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    major: "",
    classNumber: "",
    teacherName: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/CreateStudentAccount", data);
      router.push("/sign-in");
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 space-y-6">
      <h1 className="text-2xl font-bold text-center text-[#1E3A8A]">
        Create Student Account
      </h1>

      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#1E3A8A] tracking-wide">
            Upload Excel
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Import data siswa langsung dari file Excel
          </p>
        </div>

        <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
          <label
            htmlFor="excel-file"
            className="flex flex-col items-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#1E3A8A"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V3m0 0L8.25 6.75M12 3l3.75 3.75M4.5 15.75v3A2.25 2.25 0 006.75 21h10.5a2.25 2.25 0 002.25-2.25v-3"
                />
              </svg>
            </div>

            <span className="mt-3 text-sm font-medium text-[#1E3A8A]">
              Klik untuk unggah file Excel
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Format yang didukung: .xlsx, .xls
            </span>
          </label>

          <input
            id="excel-file"
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              console.log("Uploaded:", file.name);
            }}
          />
        </div>
      </div>

      <div className="border-[1px] border-black"></div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <h1 className="text-2xl font-bold text-center text-[#1E3A8A]">
          Create Manually
        </h1>

        <Input
          name="username"
          placeholder="Username"
          type="text"
          minLength={3}
          required
          disabled={loading}
          onChange={handleChange}
          className="focus-visible:ring-[#3B82F6]"
        />

        <Input
          name="email"
          placeholder="Email"
          type="email"
          required
          disabled={loading}
          onChange={handleChange}
          className="focus-visible:ring-[#3B82F6]"
        />

        {/* Grade */}
        <Select
          onValueChange={(v: any) => setData({ ...data, grade: v })}
          disabled={loading}
        >
          <SelectTrigger className="focus:ring-[#3B82F6]">
            <SelectValue placeholder="Select Grade" />
          </SelectTrigger>
          <SelectContent>
            {grades.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Major */}
        <Select
          onValueChange={(v: any) => setData({ ...data, major: v })}
          disabled={loading}
        >
          <SelectTrigger className="focus:ring-[#3B82F6]">
            <SelectValue placeholder="Select Major" />
          </SelectTrigger>
          <SelectContent>
            {majors.map((m) => (
              <SelectItem key={m} value={m}>
                {m.startsWith("softwareEngineering")
                  ? "Software Engineering"
                  : "Accounting"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Class Number */}
        <Select
          onValueChange={(v: any) => setData({ ...data, classNumber: v })}
          disabled={loading}
        >
          <SelectTrigger className="focus:ring-[#3B82F6]">
            <SelectValue placeholder="Class Number" />
          </SelectTrigger>
          <SelectContent>
            {classNumbers.map((num) => (
              <SelectItem key={num} value={String(num)}>
                {num}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Teacher */}
        <Select
          onValueChange={(v: any) => setData({ ...data, teacherName: v })}
          disabled={loading}
        >
          <SelectTrigger className="focus:ring-[#3B82F6]">
            <SelectValue placeholder="Your Teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          name="password"
          placeholder="Password"
          type="password"
          minLength={8}
          required
          disabled={loading}
          onChange={handleChange}
          className="focus-visible:ring-[#3B82F6]"
        />

        <Input
          name="confirmPassword"
          placeholder="Confirm Password"
          type="password"
          minLength={8}
          required
          disabled={loading}
          onChange={handleChange}
          className="focus-visible:ring-[#3B82F6]"
        />

        {/* BUTTON */}
        <Button
          className="w-full bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-semibold"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
};

export default CreateStudentAccount;
