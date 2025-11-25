"use client";

import { ReactNode } from "react";
import Image from 'next/image';

interface ChatCardProps {
  avatar?: string;
  name: string;
  message: string;
  time?: string;
  right?: boolean; // para diferenciar mensajes del usuario
}

export default function ChatCard({
  avatar,
  name,
  message,
  time,
  right = false,
}: ChatCardProps) {
  return (
    <div
      className={`flex items-start space-x-3 my-2 ${
        right ? "justify-end" : ""
      }`}
    >
      {!right && avatar && (
        <div className="w-10 h-10 relative rounded-full overflow-hidden">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
      )}
      <div
        className={`rounded-2xl px-4 py-2 max-w-xs shadow 
        ${right ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}
      >
        <p className="text-sm font-semibold">{!right && name}</p>
        <p className="text-sm">{message}</p>
        {time && (
          <p
            className={`text-xs mt-1 ${
              right ? "text-indigo-200" : "text-gray-500"
            }`}
          >
            {time}
          </p>
        )}
      </div>
      {right && avatar && (
        <div className="w-10 h-10 relative rounded-full overflow-hidden">
          <Image src={avatar} alt={name} fill className="object-cover" />
        </div>
      )}
    </div>
  );
}
