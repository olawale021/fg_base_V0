'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import type { ContentItem } from '@/app/admin/page';

interface ContentEditorProps {
  item: ContentItem | null;
  onSave: (item: ContentItem) => void;
  onClose: () => void;
  nextDisplayOrder: number;
}

const CATEGORIES = [
  { slug: 'problem-clarity', label: 'Problem Clarity' },
  { slug: 'customer-understanding', label: 'Customer Understanding' },
  { slug: 'product-development', label: 'Product Development' },
  { slug: 'traction-validation', label: 'Traction & Validation' },
  { slug: 'execution-consistency', label: 'Execution Consistency' },
  { slug: 'team-building', label: 'Team Building' },
  { slug: 'founder-identity', label: 'Founder Identity' },
];

const FORMATS = [
  { value: 'lesson', label: 'Lesson' },
  { value: 'article', label: 'Article' },
  { value: 'story', label: 'Story' },
  { value: 'debate', label: 'Debate' },
  { value: 'conversation', label: 'Conversation' },
];

interface BreakdownPoint {
  title: string;
  description: string;
}

export function ContentEditor({ item, onSave, onClose, nextDisplayOrder }: ContentEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState(item?.title || '');
  const [slug, setSlug] = useState(item?.slug || '');
  const [description, setDescription] = useState(item?.description || '');
  const [format, setFormat] = useState<ContentItem['format']>(item?.format || 'lesson');
  const [categorySlug, setCategorySlug] = useState(item?.category_slug || 'problem-clarity');
  const [tags, setTags] = useState(item?.tags?.join(', ') || '');
  const [isPremium, setIsPremium] = useState(item?.is_premium || false);
  const [isPublished, setIsPublished] = useState(item?.is_published ?? true);
  const [durationMinutes, setDurationMinutes] = useState(item?.estimated_duration_minutes || 5);
  const [author, setAuthor] = useState(item?.author || 'Founder Groundworks Team');
  const [displayOrder, setDisplayOrder] = useState(item?.display_order || nextDisplayOrder);

  // Content state
  const [intro, setIntro] = useState(item?.content?.intro || '');
  const [quickBreakdown, setQuickBreakdown] = useState<BreakdownPoint[]>(
    item?.content?.quickBreakdown || [
      { title: '', description: '' },
      { title: '', description: '' },
      { title: '', description: '' },
    ]
  );
  const [rememberThisTitle, setRememberThisTitle] = useState(item?.content?.rememberThis?.title || 'Remember this:');
  const [rememberThisContent, setRememberThisContent] = useState(item?.content?.rememberThis?.content || '');

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!item) {
      setSlug(generateSlug(value));
    }
  };

  const handleBreakdownChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...quickBreakdown];
    updated[index] = { ...updated[index], [field]: value };
    setQuickBreakdown(updated);
  };

  const addBreakdownPoint = () => {
    setQuickBreakdown([...quickBreakdown, { title: '', description: '' }]);
  };

  const removeBreakdownPoint = (index: number) => {
    if (quickBreakdown.length <= 1) return;
    setQuickBreakdown(quickBreakdown.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    // Validate required fields
    if (!title.trim()) {
      setError('Title is required');
      setIsSaving(false);
      return;
    }
    if (!slug.trim()) {
      setError('Slug is required');
      setIsSaving(false);
      return;
    }
    if (!intro.trim()) {
      setError('Intro is required');
      setIsSaving(false);
      return;
    }

    const contentData = {
      id: item?.id,
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim() || null,
      format,
      content: {
        intro: intro.trim(),
        quickBreakdown: quickBreakdown.filter(p => p.title.trim() || p.description.trim()),
        rememberThis: {
          title: rememberThisTitle.trim(),
          content: rememberThisContent.trim(),
        },
      },
      category_slug: categorySlug,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      is_premium: isPremium,
      is_published: isPublished,
      estimated_duration_minutes: durationMinutes,
      author: author.trim(),
      display_order: displayOrder,
    };

    try {
      const response = await fetch('/api/content', {
        method: item ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save content');
      }

      onSave(result.data);
    } catch (err) {
      console.error('Error saving content:', err);
      setError(err instanceof Error ? err.message : 'Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>{item ? 'Edit Content' : 'Add New Content'}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto py-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Who to Recruit First"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="who-to-recruit-first"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Learn how to build your first team with ownership, not just skills."
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentItem['format'])}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
              >
                {FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full h-9 px-3 rounded-md border bg-background text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 5)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Founder Groundworks Team"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="team, recruitment, ownership"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="size-4 rounded border"
              />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="size-4 rounded border"
              />
              <span className="text-sm">Premium Content</span>
            </label>
          </div>

          {/* Content Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Content</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="intro">Intro *</Label>
                <textarea
                  id="intro"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="Picture this:&#10;You are a first-time founder..."
                  className="w-full min-h-[150px] px-3 py-2 rounded-md border bg-background text-sm resize-y"
                />
                <p className="text-xs text-muted-foreground">
                  Start with &quot;Picture this:&quot; to create an engaging scenario
                </p>
              </div>

              {/* Quick Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Quick Breakdown Points</Label>
                  <Button variant="outline" size="sm" onClick={addBreakdownPoint}>
                    <Plus className="size-4 mr-1" />
                    Add Point
                  </Button>
                </div>

                {quickBreakdown.map((point, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Point {index + 1}</span>
                      {quickBreakdown.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeBreakdownPoint(index)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={point.title}
                      onChange={(e) => handleBreakdownChange(index, 'title', e.target.value)}
                      placeholder="Point title (e.g., 'Risk coverage, not team.')"
                    />
                    <textarea
                      value={point.description}
                      onChange={(e) => handleBreakdownChange(index, 'description', e.target.value)}
                      placeholder="Point description..."
                      className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background text-sm resize-y"
                    />
                  </div>
                ))}
              </div>

              {/* Remember This */}
              <div className="space-y-3">
                <Label>Remember This</Label>
                <div className="bg-primary/5 rounded-lg p-4 space-y-3 border border-primary/20">
                  <Input
                    value={rememberThisTitle}
                    onChange={(e) => setRememberThisTitle(e.target.value)}
                    placeholder="Remember this:"
                  />
                  <textarea
                    value={rememberThisContent}
                    onChange={(e) => setRememberThisContent(e.target.value)}
                    placeholder="Only keep people who consistently turn unclear problems into finished outputs..."
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background text-sm resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4 mr-2" />
                Save Content
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
