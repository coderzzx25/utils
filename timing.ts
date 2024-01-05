interface IDebounceOptions {
  leading?: boolean;
  result?: (value: any) => void;
}

/**
 * 防抖
 * @param fn 需要防抖的函数
 * @param delay 防抖的时间
 * @param options 配置项
 * @returns 返回一个防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 500,
  options?: IDebounceOptions
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const leading = options?.leading || false;
  const resultCallback = options?.result || null;

  const handleFn = function (this: void, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    if (leading && !timer) {
      // 通过一个变量来记录是否立即执行
      const isInvoke = true;
      callFn(args, isInvoke);

      // 定时器通过修改 timer 来修改 instant
      timer = setTimeout(() => {
        timer = null;
      }, delay);
    } else {
      timer = setTimeout(() => {
        // 在执行时，通过 apply 来使用 args
        callFn(args);
      }, delay);
    }
  };

  function callFn(args: Parameters<T>, isInvoke: boolean = false) {
    const res = fn(...args);
    if (resultCallback && isInvoke) {
      resultCallback(res);
    }
  }

  // 取消处理
  handleFn.cancel = function () {
    if (timer) clearTimeout(timer);
  };

  return handleFn as T & { cancel(): void };
}

interface IThrottleOptions {
  trailing?: boolean;
  result?: (value: any) => void;
}

/**
 * 节流
 * @param fn 需要节流的函数
 * @param interval 节流的时间
 * @param options 配置项
 * @returns 返回一个节流函数
 */
export function throttle<F extends (...args: any[]) => any>(
  fn: F,
  interval: number,
  options?: IThrottleOptions
): (...args: Parameters<F>) => ReturnType<F> {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  if (!options) options = {};

  const trailing = options.trailing || false;
  const resultCallback = options.result || null;

  const handleFn = function (...args: Parameters<F>): ReturnType<F> {
    const now = new Date().getTime();
    if (now - last > interval) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      last = now;
      return callFn(args);
    } else if (timer === null && trailing) {
      timer = setTimeout(() => {
        timer = null;
        last = new Date().getTime();
        callFn(args);
      }, interval);
    }

    // 如果不是 trailing 或者时间未到，返回一个空值
    return undefined as ReturnType<F>;
  };

  handleFn.cancel = function () {
    clearTimeout(timer as ReturnType<typeof setTimeout>);
    timer = null;
  };

  function callFn(argument: Parameters<F>): ReturnType<F> {
    const res = fn(...argument);
    if (resultCallback) {
      resultCallback(res);
    }
    return res;
  }

  return handleFn;
}
