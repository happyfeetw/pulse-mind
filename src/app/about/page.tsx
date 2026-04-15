export default function AboutPage() {
  const skills = [
    "Java", "Rust", "Go", "Python",
    "Spring Boot", "Tokio", "Actix-web",
    "PostgreSQL", "Redis", "Vector DB",
    "LLM", "RAG", "AI Agent",
    "React", "Next.js", "TypeScript"
  ];

  const interests = [
    {
      title: "AI Agent 架构与实现",
      desc: "让 LLM 真正成为能自主工作的智能体"
    },
    {
      title: "RAG 与知识管理",
      desc: "构建企业级知识库系统"
    },
    {
      title: "Rust 语言生态",
      desc: "探索高性能、安全的系统编程"
    },
    {
      title: "独立开发",
      desc: "从零到一构建有价值的产品"
    }
  ];

  return (
    <div style={{ padding: '64px 0 120px' }}>
      <div className="container">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Header */}
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            {/* Avatar */}
            <div style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: 'linear-gradient(135deg, var(--color-terracotta), #e8a090)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <span style={{ fontSize: 48 }}>👨‍💻</span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
              fontSize: 36,
              color: 'var(--color-near-black)',
              marginBottom: 8
            }}>
              Spike
            </h1>
            <p style={{ fontSize: 16, color: 'var(--color-olive-gray)' }}>
              后端开发者 · AI 探索者 · 独立项目实践者
            </p>
          </header>

          {/* About */}
          <section className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
              fontSize: 20,
              color: 'var(--color-near-black)',
              marginBottom: 16
            }}>
              关于我
            </h2>
            <div style={{ 
              fontSize: 16, 
              lineHeight: 1.75, 
              color: 'var(--color-olive-gray)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <p>
                你好！我是 Spike，一名在后端开发领域耕耘多年的工程师，主要使用 Java / Rust 进行系统开发。
              </p>
              <p>
                最近几年 AI 技术的飞速发展让我着迷，我开始深入研究 LLM 应用、RAG 架构以及 AI Agent 的设计与实现。同时也在探索独立开发者的可能性，希望通过这个网站记录和分享我的学习与实践。
              </p>
            </div>
          </section>

          {/* Skills */}
          <section className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
              fontSize: 20,
              color: 'var(--color-near-black)',
              marginBottom: 16
            }}>
              技术栈
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.map((skill) => (
                <span 
                  key={skill}
                  style={{
                    padding: '6px 14px',
                    fontSize: 14,
                    background: 'var(--color-warm-sand)',
                    color: 'var(--color-charcoal-warm)',
                    borderRadius: 8
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Interests */}
          <section className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
              fontSize: 20,
              color: 'var(--color-near-black)',
              marginBottom: 20
            }}>
              兴趣与关注
            </h2>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 16
            }}>
              {interests.map((item, i) => (
                <div 
                  key={i}
                  style={{ 
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start'
                  }}
                >
                  <span style={{ 
                    color: 'var(--color-terracotta)',
                    fontSize: 16,
                    marginTop: 2
                  }}>
                    ▹
                  </span>
                  <div>
                    <p style={{ 
                      fontSize: 15,
                      fontWeight: 500,
                      color: 'var(--color-near-black)',
                      marginBottom: 2
                    }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--color-olive-gray)' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="card" style={{ padding: 32 }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 500,
              fontSize: 20,
              color: 'var(--color-near-black)',
              marginBottom: 20
            }}>
              联系方式
            </h2>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 12
            }}>
              {[
                { icon: "📧", label: "Email", href: "mailto:hello@example.com" },
                { icon: "🐙", label: "GitHub", href: "https://github.com" },
                { icon: "📡", label: "RSS", href: "/rss" },
              ].map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    background: 'var(--color-warm-sand)',
                    borderRadius: 10,
                    fontSize: 15,
                    color: 'var(--color-charcoal-warm)',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
