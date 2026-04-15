"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/utils";

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
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "ai",
    tags: "",
    source: "原创",
    featured: false,
    published: false,
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error("Article not found");
      const article: Article = await res.json();

      setFormData({
        title: article.title,
        summary: article.summary,
        content: article.content,
        category: article.category,
        tags: article.tags?.join(", ") || "",
        source: article.source || "原创",
        featured: article.featured,
        published: article.published,
      });
    } catch (err) {
      setError("获取文章失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (publish?: boolean) => {
    setSaving(true);
    setError(null);

    try {
      const published = publish !== undefined ? publish : formData.published;

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          published,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      router.push("/admin/articles");
    } catch (err) {
      setError("保存文章失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        加载中...
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <p style={{ color: "var(--color-error)", marginBottom: 16 }}>{error}</p>
        <Link href="/admin/articles" className="btn btn-outline">
          返回列表
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/admin/articles"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "var(--color-olive-gray)",
            }}
          >
            ← 返回
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: 28,
              fontWeight: 500,
              color: "var(--color-near-black)",
            }}
          >
            编辑文章
          </h1>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-outline"
            disabled={!formData.content}
          >
            {showPreview ? "编辑" : "预览"}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            className="btn btn-secondary"
            disabled={saving}
          >
            保存草稿
          </button>
          <button
            onClick={() => handleSubmit(true)}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? "保存中..." : "保存并发布"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: 12,
            background: "rgba(181, 51, 51, 0.1)",
            borderRadius: 8,
            color: "var(--color-error)",
            marginBottom: 24,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 24,
        }}
      >
        {/* Editor / Preview */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {!showPreview ? (
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              placeholder="在此输入 Markdown 内容..."
              style={{
                width: "100%",
                minHeight: 500,
                padding: 20,
                border: "none",
                resize: "vertical",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                lineHeight: 1.7,
                background: "transparent",
                color: "var(--color-near-black)",
              }}
            />
          ) : (
            <div
              style={{
                padding: 20,
                minHeight: 500,
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                {formData.content || "暂无内容"}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar - Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Basic Info */}
          <div className="card">
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-near-black)",
                marginBottom: 16,
              }}
            >
              基本信息
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-olive-gray)",
                    marginBottom: 6,
                  }}
                >
                  标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="input"
                  placeholder="文章标题"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-olive-gray)",
                    marginBottom: 6,
                  }}
                >
                  摘要 *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData({ ...formData, summary: e.target.value })
                  }
                  className="input"
                  placeholder="文章摘要..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-olive-gray)",
                    marginBottom: 6,
                  }}
                >
                  分类
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-olive-gray)",
                    marginBottom: 6,
                  }}
                >
                  来源
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="input"
                  placeholder="原创 / 机器之心 / ..."
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--color-olive-gray)",
                    marginBottom: 6,
                  }}
                >
                  标签
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="input"
                  placeholder="RAG, LLM, 向量数据库 (逗号分隔)"
                />
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="card">
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-near-black)",
                marginBottom: 16,
              }}
            >
              选项
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: "var(--color-charcoal-warm)" }}>
                  设为精选文章
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: "var(--color-charcoal-warm)" }}>
                  已发布
                </span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div
            className="card"
            style={{
              border: "1px solid rgba(181, 51, 51, 0.2)",
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-error)",
                marginBottom: 12,
              }}
            >
              危险区域
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--color-stone-gray)",
                marginBottom: 12,
              }}
            >
              删除后无法恢复，请谨慎操作。
            </p>
            <button
              onClick={async () => {
                if (!confirm("确定要删除这篇文章吗？")) return;
                await fetch(`/api/articles/${id}`, { method: "DELETE" });
                router.push("/admin/articles");
              }}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 8,
                background: "rgba(181, 51, 51, 0.1)",
                color: "var(--color-error)",
                border: "none",
                cursor: "pointer",
              }}
            >
              删除文章
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
