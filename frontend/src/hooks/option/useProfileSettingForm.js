"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { checkUserEmail, getUser, updateUser } from "@/lib/api/users"
import { useAuthStore } from "@/store/authStore"

const THEME_OPTIONS = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
]

const EMPTY_FORM = {
  nickname: "",
  profileImage: "",
  email: "",
}

function createStatus(tone, message) {
  return { tone, message }
}

function getSavedTheme() {
  return localStorage.getItem("theme") ?? "system"
}

function applyTheme(value) {
  if (value === "system") {
    localStorage.removeItem("theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", systemDark)
    return
  }

  localStorage.setItem("theme", value)
  document.documentElement.classList.toggle("dark", value === "dark")
}

function normalizeProfileImage(value) {
  return typeof value === "string" ? value : ""
}

function createFormValues(user) {
  return {
    nickname: user?.name ?? "",
    profileImage: normalizeProfileImage(user?.profileImage),
    email: user?.email ?? "",
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("이미지 파일을 읽지 못했습니다."))
    reader.readAsDataURL(file)
  })
}

export function useProfileSettingForm() {
  const queryClient = useQueryClient()
  const imageInputRef = useRef(null)
  const userId = useAuthStore((state) => state.user?.userId)

  const [theme, setTheme] = useState("system")
  const [savedTheme, setSavedTheme] = useState("system")
  const [form, setForm] = useState(EMPTY_FORM)
  const [initialValues, setInitialValues] = useState(null)
  const [status, setStatus] = useState(null)

  const settingsQuery = useQuery({
    queryKey: ["user-settings", userId],
    enabled: Boolean(userId),
    queryFn: () => getUser(userId),
  })

  useEffect(() => {
    const nextTheme = getSavedTheme()
    setTheme(nextTheme)
    setSavedTheme(nextTheme)
  }, [])

  useEffect(() => {
    setForm(EMPTY_FORM)
    setInitialValues(null)
    setStatus(null)
  }, [userId])

  useEffect(() => {
    if (!settingsQuery.data || initialValues) return

    const nextValues = createFormValues(settingsQuery.data)
    setForm(nextValues)
    setInitialValues(nextValues)
  }, [initialValues, settingsQuery.data])

  const hasProfileChanges = Boolean(initialValues) && (
    form.nickname.trim() !== initialValues.nickname.trim() ||
    form.profileImage !== initialValues.profileImage ||
    form.email.trim() !== initialValues.email.trim()
  )

  const hasThemeChanges = theme !== savedTheme
  const hasAnyChanges = hasProfileChanges || hasThemeChanges
  const isReady = Boolean(initialValues)

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("로그인 정보를 확인할 수 없습니다.")
      }

      if (!settingsQuery.data) {
        throw new Error("프로필 정보를 먼저 불러와 주세요.")
      }

      const trimmedNickname = form.nickname.trim()
      const trimmedEmail = form.email.trim()
      const payload = {
        name: trimmedNickname,
        profileImage: form.profileImage || null,
        email: trimmedEmail,
      }

      const userResponse = await updateUser(userId, payload)

      return userResponse ?? {
        ...settingsQuery.data,
        ...payload,
      }
    },
    onSuccess: (nextUser) => {
      queryClient.setQueryData(["user-settings", userId], nextUser)

      const nextValues = createFormValues(nextUser)
      setForm(nextValues)
      setInitialValues(nextValues)
      setSavedTheme(theme)
      setStatus(createStatus("success", "프로필 설정을 저장했습니다."))
    },
  })

  const checkEmail = useMutation({
    mutationFn: async () => {
      const trimmedEmail = form.email.trim()

      if (!trimmedEmail) {
        throw new Error("이메일을 입력해 주세요.")
      }

      await checkUserEmail(trimmedEmail)
    },
    onSuccess: () => {
      setStatus(createStatus("success", "인증 요청을 보냈습니다. 메일함을 확인해 주세요."))
    },
  })

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setStatus(null)
  }

  function handleNicknameChange(event) {
    updateField("nickname", event.target.value)
  }

  function handleEmailChange(event) {
    updateField("email", event.target.value)
  }

  function handleThemeChange(values) {
    if (!values?.length) return

    const nextTheme = values[0]
    setTheme(nextTheme)
    applyTheme(nextTheme)
    setStatus(null)
  }

  function handleOpenImagePicker() {
    imageInputRef.current?.click()
  }

  async function handleImageChange(event) {
    const input = event.target
    const selectedFile = input.files?.[0]

    if (!selectedFile) return

    if (!selectedFile.type.startsWith("image/")) {
      setStatus(createStatus("error", "이미지 파일만 선택할 수 있습니다."))
      input.value = ""
      return
    }

    try {
      const nextImage = await readFileAsDataUrl(selectedFile)

      if (typeof nextImage === "string") {
        updateField("profileImage", nextImage)
      }
    } catch (error) {
      setStatus(createStatus("error", error.message ?? "이미지 파일을 읽지 못했습니다."))
    } finally {
      input.value = ""
    }
  }

  function handleRemoveImage() {
    updateField("profileImage", "")
  }

  async function handleCheckEmail() {
    setStatus(null)

    try {
      await checkEmail.mutateAsync()
    } catch (error) {
      setStatus(createStatus("error", error.message ?? "이메일 인증 요청에 실패했습니다."))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus(null)

    if (!initialValues) return

    const trimmedNickname = form.nickname.trim()
    if (!trimmedNickname) {
      setStatus(createStatus("error", "닉네임은 비워둘 수 없습니다."))
      return
    }

    if (!hasAnyChanges) {
      setStatus(createStatus("error", "변경된 내용이 없습니다."))
      return
    }

    if (!hasProfileChanges && hasThemeChanges) {
      setSavedTheme(theme)
      setStatus(createStatus("success", "테마 설정을 적용했습니다."))
      return
    }

    try {
      await saveSettings.mutateAsync()
    } catch (error) {
      setStatus(createStatus("error", error.message ?? "프로필 설정 저장에 실패했습니다."))
    }
  }

  function handleCancel() {
    if (initialValues) {
      setForm(initialValues)
    }

    setTheme(savedTheme)
    applyTheme(savedTheme)
    setStatus(null)
  }

  return {
    form,
    imageInputRef,
    isBusy: settingsQuery.isPending || saveSettings.isPending,
    isCheckingEmail: checkEmail.isPending,
    isReady,
    isSaving: saveSettings.isPending,
    profileImageSrc: form.profileImage || null,
    settingsQuery,
    status,
    theme,
    themeOptions: THEME_OPTIONS,
    handleCancel,
    handleCheckEmail,
    handleEmailChange,
    handleImageChange,
    handleNicknameChange,
    handleOpenImagePicker,
    handleRemoveImage,
    handleSubmit,
    handleThemeChange,
  }
}
