"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "https://practice.amirm.me";

export default function SingupPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const handleClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: userName, password: password }),
    });
    if (res.status === 200) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      router.push("/shop");
      
    } else if (res.status === 401) {
      setMessage(" Wrong username or password");
    } else if (res.status === 400) {
      setMessage("wrong");
    } else {
      setMessage(" problem  ");
    }
  };

  return (
    <div className="flex flex-col items-center mt-5 ">
      <form
        onSubmit={handleClick}
        className="flex flex-col border-4 border-black w-3xl items-center py-4 gap-3 bg-blue-600  "
      >
        <h1 className="text-4xl text-white font-bold py-5  ">Welome</h1>
        <input
          className="text-amber-100 border-2 rounded-4xl border-amber-500"
          type="text"
          placeholder=" Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        ></input>
        <input
          className="text-amber-100 border-2 rounded-4xl border-amber-500 "
          type="password"
          placeholder=" Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>

        <button
          type="submit"
          className="border-2 border-amber-500 rounded-b-xl rotate-12 my-3 py-2 px-4 font-semibold text-amber-100"
        >
          Submite
        </button>
      </form>
      <p className="mt-4 font-semibold ">
        Dont have account?
        <Link
          className="border-2 border-amber-400 rounded-4xl bg-purple-800 text-yellow-400 px-3 py-2"
          href="/Singup"
        >
          Singup
        </Link>
      </p>
      <p className="font-extrabold text-4xl mt-3">{message}</p>
    </div>
  );
}
