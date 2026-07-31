"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  tags: string | null;
  coverImage: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  author?: { name: string | null };
}

const categories = ["adventure", "gear", "training", "trail-guide", "community", "news"];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", category: "adventure", tags: "", coverImage: "", published: false, featured: false });

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    const res = await fetch("/api/admin/blog");
    if (res.ok) setPosts(await res.json());
  }

  function startEdit(post: BlogPost) {
    const tags = post.tags ? (JSON.parse(post.tags) as string[]).join(", ") : "";
    setForm({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content, category: post.category, tags, coverImage: post.coverImage || "", published: post.published, featured: post.featured });
    setEditing(post);
    setShowForm(true);
  }

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", category: "adventure", tags: "", coverImage: "", published: false, featured: false });
    setEditing(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
    const method = editing ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchPosts();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    fetchPosts();
  }

  function generateSlug() {
    setForm((f) => ({ ...f, slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-sm p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={generateSlug}>Auto</Button>
            </div>
          </div>
          <Input label="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary..." />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-surface border border-border rounded-sm px-3 py-2 text-sm text-foreground">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="gear, tips, trails" />
            <Input label="Cover Image URL" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-orange" />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-orange" />
              <span className="text-sm">Featured</span>
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editing ? "Update" : "Create"} Post</Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between bg-surface border border-border rounded-sm p-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-heading font-semibold truncate">{post.title}</h3>
                <Badge variant={post.published ? "success" : "muted"}>{post.published ? "Published" : "Draft"}</Badge>
                {post.featured && <Badge variant="warning">Featured</Badge>}
                <Badge variant="orange">{post.category}</Badge>
              </div>
              <p className="text-xs text-muted">/blog/{post.slug} · {post.author?.name || "Unknown"} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Not published"}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => startEdit(post)} className="p-2 text-muted hover:text-orange transition-colors"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(post.id)} className="p-2 text-muted hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-muted text-center py-8">No blog posts yet.</p>}
      </div>
    </div>
  );
}
