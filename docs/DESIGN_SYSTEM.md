# OAC Portal - Design System

## 🎨 Color Palette (OKLCH)

### Primary Colors
```css
--color-primary: oklch(51% 0.18 16)           /* Rich Red #b62441 */
--color-primary-foreground: oklch(100% 0 0)   /* White */
--color-primary-hover: oklch(56% 0.18 16)     /* Lighter Red */
--color-primary-dark: oklch(41% 0.18 16)      /* Darker Red */
```

### Background Colors
```css
--color-background: oklch(8% 0.02 12)         /* Deep Dark */
--color-foreground: oklch(95% 0.005 0)        /* Off White */
--color-card: oklch(12% 0.025 12)             /* Card Background */
--color-muted: oklch(15% 0.025 12)            /* Muted Background */
--color-muted-foreground: oklch(65% 0.01 12)  /* Muted Text */
```

### Status Colors
```css
--color-success: oklch(64% 0.2 132)           /* Green */
--color-warning: oklch(68% 0.162 76)          /* Orange/Yellow */
--color-error: oklch(60% 0.184 16)            /* Red */
--color-info: oklch(70% 0.16 233)             /* Blue */
```

### Border & Input
```css
--color-border: oklch(20% 0.03 12)            /* Subtle Border */
--color-input: oklch(20% 0.03 12)             /* Input Border */
--color-ring: oklch(51% 0.18 16)              /* Focus Ring */
```

## 📐 Spacing Scale

```css
0.5rem  = 8px   /* xs */
0.75rem = 12px  /* sm */
1rem    = 16px  /* base */
1.5rem  = 24px  /* lg */
2rem    = 32px  /* xl */
3rem    = 48px  /* 2xl */
4rem    = 64px  /* 3xl */
6rem    = 96px  /* 4xl */
```

## 🔤 Typography

### Font Family
```css
font-family: Inter, system-ui, sans-serif;
```

### Font Sizes
```css
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)  /* Minimum for iOS */
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
text-6xl:  3.75rem  (60px)
text-7xl:  4.5rem   (72px)
```

### Font Weights
```css
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
```

## 🎯 Border Radius

```css
--radius-sm: 0.5rem   (8px)   /* Small elements */
--radius-md: 0.75rem  (12px)  /* Buttons, inputs */
--radius-lg: 1rem     (16px)  /* Cards */
```

## 🌟 Component Classes

### Glass Card
```css
.glass-card {
  backdrop-filter: blur(24px);
  background: linear-gradient(135deg, oklch(100% 0 0 / 0.1), oklch(100% 0 0 / 0.05));
  border: 1px solid oklch(100% 0 0 / 0.2);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px 0 oklch(0% 0 0 / 0.3);
}
```

### Glass Button
```css
.glass-button {
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  background: linear-gradient(to right, var(--color-primary), var(--color-primary-dark));
  box-shadow: 0 4px 15px 0 oklch(51% 0.18 16 / 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px 0 oklch(51% 0.18 16 / 0.6);
}
```

### Depth Card
```css
.depth-card {
  background: linear-gradient(135deg, oklch(15% 0.02 12 / 0.8), oklch(8% 0.01 12 / 0.4));
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: 
    0 4px 6px -1px oklch(0% 0 0 / 0.1),
    0 20px 25px -5px oklch(51% 0.18 16 / 0.1);
  transition: all 0.5s ease;
}

.depth-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 25px 50px -12px oklch(0% 0 0 / 0.25),
    0 20px 25px -5px oklch(51% 0.18 16 / 0.2);
}
```

### Text Gradient
```css
.text-gradient-red {
  background: linear-gradient(to right, oklch(61% 0.18 16), oklch(41% 0.18 16));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

### Text Glow
```css
.text-glow {
  text-shadow: 0 0 20px oklch(51% 0.18 16 / 0.5);
}
```

## 🎭 Animations

### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}
```

### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 5px oklch(51% 0.18 16 / 0.5);
  }
  50% { 
    box-shadow: 0 0 20px oklch(51% 0.18 16 / 0.8);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

## 🎪 Status Badges

### Success Badge
```jsx
<span className="bg-success/20 text-success border-success/50 border px-3 py-1 rounded-full text-xs font-semibold">
  Elfogadva
</span>
```

### Warning Badge
```jsx
<span className="bg-warning/20 text-warning border-warning/50 border px-3 py-1 rounded-full text-xs font-semibold">
  Függőben
</span>
```

### Error Badge
```jsx
<span className="bg-error/20 text-error border-error/50 border px-3 py-1 rounded-full text-xs font-semibold">
  Elutasítva
</span>
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## 🎯 Button Variants

### Primary Button (Glass)
```jsx
<button className="glass-button">
  Jelentkezés
</button>
```

### Outline Button
```jsx
<button className="px-8 py-4 rounded-xl font-semibold border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all">
  Tudj Meg Többet
</button>
```

### Success Button
```jsx
<button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-success to-success/80 text-success-foreground shadow-lg shadow-success/30 hover:shadow-success/50 hover:-translate-y-0.5">
  Jóváhagyás
</button>
```

### Error Button
```jsx
<button className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-error to-error/80 text-error-foreground shadow-lg shadow-error/30 hover:shadow-error/50 hover:-translate-y-0.5">
  Elutasítás
</button>
```

## 🖼️ Icon Containers

### Primary Icon Container
```jsx
<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
  <Icon className="h-6 w-6 text-primary" />
</div>
```

### Warning Icon Container (Admin)
```jsx
<div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/20 border-2 border-warning/50">
  <Shield className="h-6 w-6 text-warning" />
</div>
```

## 📋 Form Elements

### Input Field
```jsx
<input
  className="w-full h-12 pl-11 pr-4 bg-card/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
  placeholder="Email cím"
/>
```

### Input with Icon
```jsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
  <input className="w-full h-12 pl-11 pr-4 ..." />
</div>
```

## 🎨 Background Effects

### Hero Gradient
```jsx
<div className="hero-gradient">
  {/* Content */}
</div>
```

### Floating Decorations
```jsx
<div className="absolute inset-0 pointer-events-none opacity-20">
  <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl bg-primary/30 animate-float" />
  <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl bg-primary/20 animate-float" style={{ animationDelay: '1s' }} />
</div>
```

## 🔍 Usage Examples

### Section Layout
```jsx
<section className="section">
  <div className="container">
    <div className="space-y-8">
      {/* Content */}
    </div>
  </div>
</section>
```

### Card Grid
```jsx
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  <div className="depth-card">
    {/* Card content */}
  </div>
</div>
```

### Staggered Animations
```jsx
<div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
  {/* Content */}
</div>
<div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
  {/* Content */}
</div>
```

---

**Design System Version**: 1.0
**Last Updated**: December 2024
**Platform**: OAC Portal (tDarts Integration)

