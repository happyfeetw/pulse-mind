"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthSignin: "尝试构建 OAuth 签名时出错",
    OAuthCallback: "OAuth 回调出错",
    OAuthAccountNotLinked: "该邮箱已被其他账号绑定",
    Callback: "Callback 出错",
    AccessDenied: "访问被拒绝",
    Verification: "验证链接已过期或已使用",
    Default: "认证失败",
  };

  const message = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f4ed",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 400,
          padding: 32,
          background: "#faf9f5",
          border: "1px solid #f0eee6",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          ⚠️
        </div>
        <h1
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 24,
            color: "#141413",
            marginBottom: 8,
          }}
        >
          认证失败
        </h1>
        <p
          style={{
            color: "#5e5d59",
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {message}
        </p>
        <Link
          href="/auth/signin"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            background: "#c96442",
            color: "white",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          重新登录
        </Link>
      </div>
    </div>
  );
}
