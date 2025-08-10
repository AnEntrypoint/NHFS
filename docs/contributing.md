# Contributing Guide

Thanks for your interest in contributing to **NHFS**!  
Whether it's fixing bugs, adding features, or improving documentation — **you’re welcome here**.

---

## 📋 How to Contribute

### Fork & Clone the Repo

```bash
# Fork using GitHub's UI, then:
git clone https://github.com/AliSananS/NHFS.git
cd NHFS
```

### Install Dependencies

```bash
npm install
```

### Create a New Branch

```bash
git checkout -b feature/your-feature-name
```

> **Tip:** Use descriptive branch names like:
>
> - `feature/add-auth`
> - `fix/upload-bug`
> - `docs/update-readme`

### Make Your Changes

- Keep the UI **clean and minimal**
- Follow the existing code style (TypeScript, functional components, hooks)
- Use **HeroUI components** where possible
- Don’t add heavy dependencies without discussion

### Commit Your Work

```bash
git add .
git commit -m "Add: short but clear description"
```

### Push and Open a Pull Request

```bash
git push origin feature/your-feature-name
```

Then open a PR from your fork to the `main` branch of this repo.

---

## 🛠 Code Style & Guidelines

- **Formatting:** Use the default Prettier config (`npm run format`)
- **Components:** Use functional components with hooks
- **Naming:** Use clear, descriptive names (`checkFilePermissions` > `cfp`)
- **Types:** Prefer **TypeScript types/interfaces** over `any` (Try defining types in `@/types` directory )
- **UI Consistency:** Stick to the HeroUI design language ([See HeroUI's Design Principles](https://www.heroui.com/docs/guide/design-principles))

---

## 🚦 PR Review Process

1. Your PR will be reviewed for **functionality, code quality, and UI consistency and breaking changes**.
2. You may get feedback — please address it before merging.
3. Once approved, it will be merged into `main`.

---

## 💡 Ideas for Contribution

> [!NOTE]
> **Look for `TODO:` in the project.**
> There already is so much on todo, I highly recommend to take a look on these features and bug fixes.

- Bug fixes
- New file features (search, sort, filters, visual, animations, authentication, users)
- UI/UX improvements
- Documentation


---

## ⚠️ Please Avoid

- Large, unrelated changes in a single Pull Request (Try 1 or a few changes per PR)
- Adding unnecessary dependencies
- Over-complicating and bloating the UI with excessive animations

---

Happy coding! 🚀
