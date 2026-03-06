import React from "react";
import Image from "next/image";
import { Heart } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-4">
        <div className="bg-red-500/10 p-4 rounded-full w-fit mx-auto">
          <Heart className="text-red-500" size={48} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Ủng hộ tôi</h1>
        <p className="text-[#8e8e93] max-w-md">
          Nếu bạn thấy những công cụ này hữu ích, hãy mời tôi một ly cà phê nhé. 
          Sự đóng góp của bạn là động lực để tôi tiếp tục phát triển dự án này.
        </p>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl">
        <Image 
          src="https://img.vietqr.io/image/MB-0862264376-compact.png"
          alt="QR Code ủng hộ"
          width={300}
          height={400}
          className="rounded-xl"
        />
      </div>

      <div className="text-sm text-[#8e8e93] font-medium">
        Cảm ơn bạn rất nhiều! ❤️
      </div>
    </div>
  );
}
