"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  source: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  contentHtml?: string;
}

const categoryLabels: Record<string, string> = {
  ai: "AI/ML",
  backend: "后端",
  frontend: "前端",
};

export default function DocDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/articles/slug/${slug}`);
      if (!res.ok) throw new Error("Article not found");
      const data = await res.json();
      setArticle(data);
    } catch {
      setError("文章不存在或已被删除");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  if (loading) {
    return (
      <div
        style={{
          padding: "48px 0 120px",
          textAlign: "center",
          color: "var(--color-stone-gray)",
        }}
      >
        加载中...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: "48px 0 120px", textAlign: "center" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 48,
            color: "var(--color-near-black)",
            marginBottom: 16,
          }}
        >
          404
        </h1>
        <p
          style={{
            color: "var(--color-olive-gray)",
            marginBottom: 24,
          }}
        >
          {error || "文章不存在"}
        </p>
        <Link href="/docs" className="btn btn-primary">
          返回文档列表
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 0 120px" }}>
      <div className="container">
        <div style={{ display: "flex", gap: 48 }}>
          {/* Article Content */}
          <article style={{ flex: 1, minWidth: 0, maxWidth: 720 }}>
            {/* Back Link */}
            <Link
              href="/docs"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                color: "var(--color-olive-gray)",
                marginBottom: 32,
                transition: "color var(--transition-fast)",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              返回文档列表
            </Link>

            {/* Header */}
            <header style={{ marginBottom: 48 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <span
                  style={{
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 500,
                    background: "rgba(201, 100, 66, 0.1)",
                    color: "var(--color-terracotta)",
                    borderRadius: 999,
                  }}
                >
                  {categoryLabels[article.category] || article.category}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: 40,
                  color: "var(--color-near-black)",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                }}
              >
                {article.title}
              </h1>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 14,
                  color: "var(--color-stone-gray)",
                }}
              >
                <span>{article.source || "原创"}</span>
                <span
                  style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--color-stone-gray)" }}
                />
                <span>
                  {new Date(article.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </header>

            {/* Content */}
            <div
              className="prose"
              style={{
                overflowWrap: "break-word",
              }}
              dangerouslySetInnerHTML={{
                __html: article.contentHtml || "",
              }}
            />

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 48,
                  paddingTop: 24,
                  borderTop: "1px solid var(--color-border-cream)",
                }}
              >
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "4px 12px",
                      fontSize: 13,
                      background: "var(--color-warm-sand)",
                      color: "var(--color-charcoal-warm)",
                      borderRadius: 6,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
