"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "unknown";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-parchment)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          padding: 32,
          background: "var(--color-ivory)",
          border: "1px solid var(--color-border-cream)",
          borderRadius: 16,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#d32f2f",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 28,
          }}
        >
          ✕
        </div>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 24,
            fontWeight: 500,
            color: "var(--color-near-black)",
            marginBottom: 8,
          }}
        >
          登录失败
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-olive-gray)",
            marginBottom: 24,
          }}
        >
          错误: {error}
        </p>
        <a
          href="/auth/signin"
          style={{
            display: "inline-block",
            padding: "12px 24px",
            fontSize: 15,
            fontWeight: 500,
            background: "var(--color-near-black)",
            color: "var(--color-ivory)",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          返回登录页
        </a>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>加载中...</p>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
