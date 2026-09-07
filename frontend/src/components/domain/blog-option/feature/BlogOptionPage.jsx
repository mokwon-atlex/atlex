'use client';

import { useEffect, useState } from 'react';

import BlogOptionBioForm from '@/components/domain/blog-option/feature/BlogOptionBioForm';
import BlogOptionCategoryManager from '@/components/domain/blog-option/feature/BlogOptionCategoryManager';
import BlogOptionPageLayout from '@/components/domain/blog-option/layout/BlogOptionPageLayout';
import { createUserBlogCategory, deleteUserBlogCategory, updateUserBlogCategory } from '@/lib/api/users';
import { loadUserBlogCategories } from '@/lib/category/blog-categories';
import { fetchProfileByUserId, updateProfile } from '@/lib/api/profiles';
import { BLOG_OPTION_BIO_MAX_LENGTH, normalizeBlogBio } from '@/lib/blog-option';
import { useAuthStore } from '@/store/authStore';

export default function BlogOptionPage() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.userId;
  const [bio, setBio] = useState('');
  const [savedBio, setSavedBio] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [pendingUpdateId, setPendingUpdateId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [bioError, setBioError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [bioNotice, setBioNotice] = useState('');
  const [categoryNotice, setCategoryNotice] = useState('');

  function resetCategoryEditor() {
    setEditingCategoryId('');
    setEditingCategoryName('');
  }

  function validateCategoryName(name, excludedCategoryId = '') {
    const trimmedCategoryName = name.trim();

    if (!trimmedCategoryName) {
      return { error: '카테고리 이름을 입력해 주세요.' };
    }

    const hasDuplicate = categories.some(
      (category) =>
        category.id !== excludedCategoryId && category.name.toLowerCase() === trimmedCategoryName.toLowerCase(),
    );

    if (hasDuplicate) {
      return { error: '같은 이름의 카테고리가 이미 있습니다.' };
    }

    return { name: trimmedCategoryName };
  }

  useEffect(() => {
    let cancelled = false;

    async function loadBlogOption() {
      if (!userId) {
        return;
      }

      setIsLoading(true);
      setBioError('');
      setCategoryError('');

      try {
        const [profileResponse, nextCategories] = await Promise.all([
          fetchProfileByUserId(userId),
          loadUserBlogCategories(userId),
        ]);

        if (cancelled) {
          return;
        }

        const nextBio = normalizeBlogBio(profileResponse);
        const limitedBio = nextBio.slice(0, BLOG_OPTION_BIO_MAX_LENGTH);
        setBio(limitedBio);
        setSavedBio(limitedBio);
        setCategories(nextCategories);
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = error?.message ?? '블로그 옵션 정보를 불러오지 못했습니다.';
        setBioError(message);
        setCategoryError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBlogOption();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function handleSaveBio() {
    if (!userId) {
      return;
    }

    setIsSavingBio(true);
    setBioError('');
    setBioNotice('');

    try {
      const trimmedBio = bio.trim().slice(0, BLOG_OPTION_BIO_MAX_LENGTH);
      await updateProfile(userId, { info: trimmedBio });
      setBio(trimmedBio);
      setSavedBio(trimmedBio);
      setBioNotice('소개글을 저장했습니다.');
    } catch (error) {
      setBioError(error?.message ?? '소개글 저장에 실패했습니다.');
    } finally {
      setIsSavingBio(false);
    }
  }

  async function handleAddCategory(event) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    const { name: nextCategoryName, error } = validateCategoryName(categoryName);

    if (error) {
      setCategoryError(error);
      return;
    }

    setIsAddingCategory(true);
    setCategoryError('');
    setCategoryNotice('');

    try {
      await createUserBlogCategory(userId, nextCategoryName);
      const nextCategories = await loadUserBlogCategories(userId);
      setCategories(nextCategories);
      setCategoryName('');
      setCategoryNotice('카테고리를 추가했습니다.');
    } catch (error) {
      setCategoryError(error?.message ?? '카테고리 추가에 실패했습니다.');
    } finally {
      setIsAddingCategory(false);
    }
  }

  function handleStartEditCategory(category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setCategoryError('');
    setCategoryNotice('');
  }

  function handleCancelEditCategory() {
    resetCategoryEditor();
    setCategoryError('');
    setCategoryNotice('');
  }

  async function handleUpdateCategory(event, categoryId) {
    event.preventDefault();

    if (!userId || editingCategoryId !== categoryId) {
      return;
    }

    const currentCategory = categories.find((category) => category.id === categoryId);

    if (!currentCategory) {
      return;
    }

    const { name: nextCategoryName, error } = validateCategoryName(editingCategoryName, categoryId);

    if (error) {
      setCategoryError(error);
      return;
    }

    if (currentCategory.name === nextCategoryName) {
      resetCategoryEditor();
      return;
    }

    setPendingUpdateId(categoryId);
    setCategoryError('');
    setCategoryNotice('');

    try {
      await updateUserBlogCategory(userId, categoryId, nextCategoryName);
      const nextCategories = await loadUserBlogCategories(userId);
      setCategories(nextCategories);
      resetCategoryEditor();
      setCategoryNotice('카테고리를 수정했습니다.');
    } catch (error) {
      setCategoryError(error?.message ?? '카테고리 수정에 실패했습니다.');
    } finally {
      setPendingUpdateId('');
    }
  }

  async function handleDeleteCategory(categoryId) {
    if (!userId) {
      return;
    }

    setPendingDeleteId(categoryId);
    setCategoryError('');
    setCategoryNotice('');

    try {
      await deleteUserBlogCategory(userId, categoryId);
      const nextCategories = await loadUserBlogCategories(userId);
      setCategories(nextCategories);

      if (editingCategoryId === categoryId) {
        resetCategoryEditor();
      }

      setCategoryNotice('카테고리를 삭제했습니다.');
    } catch (error) {
      setCategoryError(error?.message ?? '카테고리 삭제에 실패했습니다.');
    } finally {
      setPendingDeleteId('');
    }
  }

  return (
    <BlogOptionPageLayout
      blogUserId={userId}
      bioSection={
        <BlogOptionBioForm
          bio={bio}
          savedBio={savedBio}
          isLoading={isLoading}
          isSaving={isSavingBio}
          errorMessage={bioError}
          noticeMessage={bioNotice}
          onBioChange={(value) => setBio(value.slice(0, BLOG_OPTION_BIO_MAX_LENGTH))}
          onReset={() => {
            setBio(savedBio);
            setBioError('');
            setBioNotice('');
          }}
          onSave={handleSaveBio}
        />
      }
      categorySection={
        <BlogOptionCategoryManager
          categoryName={categoryName}
          categories={categories}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          isLoading={isLoading}
          isAdding={isAddingCategory}
          pendingUpdateId={pendingUpdateId}
          pendingDeleteId={pendingDeleteId}
          errorMessage={categoryError}
          noticeMessage={categoryNotice}
          onCategoryNameChange={setCategoryName}
          onAddCategory={handleAddCategory}
          onStartEditCategory={handleStartEditCategory}
          onEditingCategoryNameChange={setEditingCategoryName}
          onCancelEditCategory={handleCancelEditCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      }
    />
  );
}
