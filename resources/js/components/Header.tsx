import React from "react";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
    onBack?: () => void;
    isMobile?: boolean;
}

export default function Header({ onBack, isMobile }: HeaderProps) {
    const showBack = isMobile && typeof onBack === "function";

    return (
        <header className="app-header">
            {showBack && (
                <button onClick={onBack} className="back-button" aria-label="Back">
                    <ArrowLeft size={22} />
                </button>
            )}
            <h1 className="app-title">SWStarter</h1>

            <style>
                {`
          .app-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: #fff;
            border-bottom: 2px solid #00b865;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 12px 0;
            height: 60px;
          }

          .back-button {
            position: absolute;
            left: 16px;
            background: none;
            border: none;
            color: #00b865;
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .app-title {
            font-size: clamp(1.1rem, 2vw, 1.4rem);
            font-weight: 700;
            color: #00b865;
            text-align: center;
          }

          @media (max-width: 720px) {
            .app-header {
              height: 55px;
              padding: 10px 0;
            }
          }
        `}
            </style>
        </header>
    );
}
