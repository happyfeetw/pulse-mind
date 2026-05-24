"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [slowHintVisible, setSlowHintVisible] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleGitHubSignIn = async () => {
    if (isSigningIn) {
      return;
    }

    let keepLoading = false;
    setIsSigningIn(true);
    setErrorMessage("");
    setSlowHintVisible(false);

    const timeoutId = window.setTimeout(() => {
      setSlowHintVisible(true);
    }, 1000);

    try {
      const callbackUrl = `${window.location.origin}/`;
      const result = await signIn("github", {
        callbackUrl,
        redirect: false,
      });

      if (result?.ok && result.url) {
        keepLoading = true;
        window.location.href = result.url;
        return;
      }

      if (result?.error) {
        setErrorMessage(
          result.error === "OAuthSignin"
            ? "GitHub 登录流程未能成功启动，请重试"
            : "登录未能开始，请稍后再试"
        );
      } else {
        setErrorMessage("未收到授权跳转地址，请刷新后重试");
      }
    } catch {
      setErrorMessage("网络异常，登录未能启动，请重试");
    } finally {
      if (!keepLoading) {
        window.clearTimeout(timeoutId);
        setSlowHintVisible(false);
        setIsSigningIn(false);
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-parchment)",
        padding: "24px",
        position: "relative",
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
            borderRadius: 16,
            background: "var(--color-terracotta)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 32,
            fontWeight: 600,
            color: "white",
            fontFamily: "var(--font-serif)",
          }}
        >
          P
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
          登录 PulseMind
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--color-olive-gray)",
            marginBottom: 32,
          }}
        >
          使用 GitHub 账号登录
        </p>

        {errorMessage && (
          <p
            style={{
              marginBottom: 16,
              fontSize: 13,
              color: "var(--color-error)",
              whiteSpace: "pre-wrap",
            }}
          >
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={isSigningIn}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "12px 20px",
            fontSize: 15,
            fontWeight: 500,
            background: "var(--color-near-black)",
            color: "var(--color-ivory)",
            border: "none",
            borderRadius: 10,
            cursor: isSigningIn ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
            opacity: isSigningIn ? 0.7 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.02 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {isSigningIn ? "正在前往 GitHub..." : "Continue with GitHub"}
        </button>

        <p
          style={{ marginTop: 24, fontSize: 12, color: "var(--color-stone-gray)" }}
        >
          登录后，普通用户可发表评论
          <br />
          只有管理员可以发布和编辑文章
        </p>
      </div>

      {isSigningIn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(20, 20, 20, 0.2)",
            backdropFilter: "blur(1.5px)",
            zIndex: 50,
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 340,
              background: "var(--color-ivory)",
              border: "1px solid var(--color-border-cream)",
              borderRadius: 12,
              padding: 20,
              textAlign: "center",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 24,
                height: 24,
                margin: "0 auto 10px",
                borderRadius: "50%",
                border: "3px solid var(--color-warm-sand)",
                borderTopColor: "var(--color-terracotta)",
                animation: "pm-spin 0.9s linear infinite",
              }}
            />
            <p
              style={{
                fontSize: 14,
                color: "var(--color-near-black)",
                fontWeight: 500,
              }}
            >
              正在连接 GitHub 登录服务
            </p>
            {slowHintVisible && (
              <p
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "var(--color-olive-gray)",
                }}
              >
                网络较慢时可能需 3-8 秒，请稍候，不要关闭页面
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pm-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
