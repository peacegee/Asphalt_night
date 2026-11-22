# Asphalt Night

React, JavaScript, Three.js, Vite ашигласан 3D уралдааны тоглоом.

## Visual Studio Code дээр ажиллуулах

1. ZIP файлыг задалж, `asphalt-night-react` хавтсыг VS Code дээр нээнэ.
2. Node.js 22.12+ суулгасан байх шаардлагатай.
3. **Terminal → New Terminal** нээгээд дараах командыг ажиллуулна.

```sh
npm install
npm run dev
```

Терминал дээр гарсан localhost хаягаар тоглоомыг нээнэ.

## Vercel дээр байрлуулах

Төслөө GitHub repository-д оруулаад Vercel дээр **Add New → Project** гэж импортолно. Төслийн үндсэн хавтсаар `package.json` байгаа хавтсыг сонгоно.

| Тохиргоо | Утга |
| --- | --- |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Deploy** дарна. Supabase болон environment variable шаардлагагүй.
