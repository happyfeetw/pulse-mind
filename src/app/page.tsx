"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  source: string | null;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

const categories = ["全部", "资讯", "技术"] as const;
type Category = (typeof categories)[number];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("全部");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch("/api/articles?published=true&limit=10");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = articles.find((a) => a.featured);
  const regularArticles = articles.filter((a) => !a.featured);

  const filteredFeatured =
    activeCategory === "全部" ||
    (featuredArticle && featuredArticle.category === activeCategory.toLowerCase())
      ? featuredArticle
      : null;

  const filteredArticles = regularArticles.filter((article) => {
    if (activeCategory === "全部") return true;
    return article.category === activeCategory.toLowerCase();
  });

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201, 100, 66, 0.08), transparent)",
            pointerEvents: "none",
          }}
        />

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(201, 100, 66, 0.06) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div className="container" style={{ position: "relative" }}>
          <div style={{ maxWidth: 720 }}>
            {/* Badge */}
            <div
              className="animate-fade-in-up"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "rgba(201, 100, 66, 0.1)",
                borderRadius: 999,
                marginBottom: 24,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "var(--color-terracotta)",
                  borderRadius: "50%",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--color-terracotta)",
                  letterSpacing: "0.02em",
                }}
              >
                每日更新 · AI 资讯与技术洞察
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-in-up stagger-1"
              style={{
                fontFamily: "var(--font-serif)",
                fontWeight: 500,
                color: "var(--color-near-black)",
                marginBottom: 20,
                letterSpacing: "-0.03em",
              }}
            >
              你好，我是 Spike
            </h1>

            {/* Subheadline */}
            <p
              className="animate-fade-in-up stagger-2"
              style={{
                fontSize: 20,
                lineHeight: 1.7,
                color: "var(--color-olive-gray)",
                marginBottom: 36,
                maxWidth: 560,
              }}
            >
              一个关注 AI 发展的独立开发者。
              <br />
              在这里分享每日资讯、技术实践与独立项目的探索。
            </p>

            {/* CTA */}
            <div
              className="animate-fade-in-up stagger-3"
              style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <a href="#news" className="btn btn-primary">
                浏览资讯
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
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </a>
              <Link href="/docs" className="btn btn-secondary">
                阅读文档
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" style={{ padding: "0 0 80px" }}>
        <div className="container">
          {/* Section Header */}
          <div
            className="animate-fade-in-up"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 32,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  fontSize: 28,
                  color: "var(--color-near-black)",
                }}
              >
                今日资讯
              </h2>
              <span className="badge">
                {new Date().toLocaleDateString("zh-CN", {
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab ${
                    activeCategory === cat ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                color: "var(--color-stone-gray)",
              }}
            >
              加载中...
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {filteredFeatured && (
                <Link href={`/docs/${filteredFeatured.slug}`}>
                  <article
                    className="card card-interactive animate-fade-in-up"
                    style={{
                      padding: 32,
                      marginBottom: 24,
                      borderLeft: "4px solid var(--color-terracotta)",
                      display: "block",
                    }}
                  >
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: 16 }}
                    >
                      {/* Meta */}
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 12 }}
                      >
                        <span className="badge badge-terracotta">
                          {filteredFeatured.category === "ai"
                            ? "资讯"
                            : "技术"}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "var(--color-stone-gray)",
                          }}
                        >
                          {filteredFeatured.source || "原创"}
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "var(--color-stone-gray)",
                          }}
                        >
                          ·
                        </span>
                        <span
                          style={{
                            fontSize: 14,
                            color: "var(--color-stone-gray)",
                          }}
                        >
                          {new Date(
                            filteredFeatured.createdAt
                          ).toLocaleDateString("zh-CN", {
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontWeight: 500,
                          fontSize: 24,
                          color: "var(--color-near-black)",
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {filteredFeatured.title}
                      </h3>

                      {/* Summary */}
                      <p
                        style={{
                          fontSize: 16,
                          lineHeight: 1.7,
                          color: "var(--color-olive-gray)",
                        }}
                      >
                        {filteredFeatured.summary}
                      </p>

                      {/* Footer */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginTop: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            color: "var(--color-stone-gray)",
                          }}
                        >
                          阅读全文
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 14,
                            fontWeight: 500,
                            color: "var(--color-terracotta)",
                          }}
                        >
                          阅读全文
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* News List */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {filteredArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/docs/${article.slug}`}
                    style={{ display: "block" }}
                  >
                    <article
                      className="card card-interactive animate-fade-in-up"
                      style={{
                        padding: 24,
                        animationDelay: `${(index + 2) * 0.05}s`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 20,
                          alignItems: "flex-start",
                        }}
                      >
                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Meta */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 10px",
                                fontSize: 12,
                                fontWeight: 500,
                                borderRadius: 999,
                                background:
                                  article.category === "技术"
                                    ? "rgba(201, 100, 66, 0.1)"
                                    : "var(--color-warm-sand)",
                                color:
                                  article.category === "技术"
                                    ? "var(--color-terracotta)"
                                    : "var(--color-charcoal-warm)",
                              }}
                            >
                              {article.category === "ai" ? "资讯" : "技术"}
                            </span>
                            <span
                              style={{
                                fontSize: 13,
                                color: "var(--color-stone-gray)",
                              }}
                            >
                              {article.source || "原创"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3
                            style={{
                              fontFamily: "var(--font-serif)",
                              fontWeight: 500,
                              fontSize: 18,
                              color: "var(--color-near-black)",
                              lineHeight: 1.35,
                              marginBottom: 8,
                              letterSpacing: "-0.01em",
                            }}
                          >
                            {article.title}
                          </h3>

                          {/* Summary */}
                          <p
                            style={{
                              fontSize: 14,
                              lineHeight: 1.6,
                              color: "var(--color-olive-gray)",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              marginBottom: 12,
                            }}
                          >
                            {article.summary}
                          </p>

                          {/* Footer */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              fontSize: 13,
                              color: "var(--color-stone-gray)",
                            }}
                          >
                            <span>
                              {new Date(
                                article.createdAt
                              ).toLocaleDateString("zh-CN", {
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span
                              style={{
                                width: 3,
                                height: 3,
                                borderRadius: "50%",
                                background: "var(--color-stone-gray)",
                              }}
                            />
                            <span>阅读</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "var(--color-warm-sand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all var(--transition-fast)",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--color-olive-gray)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {/* Empty State */}
              {filteredFeatured === null &&
                filteredArticles.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "64px 0",
                      color: "var(--color-stone-gray)",
                    }}
                  >
                    <p style={{ fontSize: 16 }}>暂无该分类的资讯</p>
                  </div>
                )}
            </>
          )}

          {/* Load More */}
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 48 }}
          >
            <Link href="/docs" className="btn btn-outline">
              查看更多资讯
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom spacing */}
      <div style={{ height: 80 }} />
    </div>
  );
}
