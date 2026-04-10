import { ref } from "vue";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

export function useToast() {
  const show = (message: string, type: ToastType = "info", duration = 4000) => {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  };

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (msg: string) => show(msg, "success");
  const error = (msg: string) => show(msg, "error");
  const info = (msg: string) => show(msg, "info");

  return { toasts, show, dismiss, success, error, info };
}
