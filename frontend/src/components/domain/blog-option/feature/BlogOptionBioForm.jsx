"use client";

import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/common/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/common/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/common/ui/field";
import { Textarea } from "@/components/common/ui/textarea";
import { BLOG_OPTION_BIO_MAX_LENGTH } from "@/lib/blog-option";

export default function BlogOptionBioForm({
  bio = "",
  savedBio = "",
  isLoading = false,
  isSaving = false,
  errorMessage = "",
  noticeMessage = "",
  onBioChange,
  onReset,
  onSave,
}) {
  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <CardTitle>유저 소개글</CardTitle>
        <CardDescription>
          블로그 프로필 카드에 노출되는 소개글을 작성합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Field>
          <FieldLabel>소개글 작성</FieldLabel>
          <Textarea
            variant="outline"
            resize="vertical"
            value={bio}
            onChange={(event) => onBioChange(event.target.value)}
            placeholder="방문자에게 보여줄 소개글을 입력해 주세요"
            className="min-h-40 rounded-2xl"
            maxLength={BLOG_OPTION_BIO_MAX_LENGTH}
            disabled={isLoading || isSaving}
          />
          <FieldDescription>
            현재 {bio.length}/{BLOG_OPTION_BIO_MAX_LENGTH}자
          </FieldDescription>
          <FieldError>{errorMessage}</FieldError>
        </Field>

        {noticeMessage ? (
          <p className="text-sm font-medium text-foreground/80">{noticeMessage}</p>
        ) : null}

        {!isLoading && !bio && !savedBio ? (
          <p className="text-sm text-muted-foreground">
            아직 저장된 소개글이 없습니다.
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading || isSaving}
          onClick={onReset}
        >
          되돌리기
        </Button>
        <Button
          type="button"
          disabled={isLoading || isSaving}
          onClick={onSave}
        >
          {isSaving ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              저장 중
            </>
          ) : (
            "저장"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
