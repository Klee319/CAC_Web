import "./welcome.css";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import catPositionConfig from './catPositionConfig.json';

// 型定義
type Props = {
    isDarkMode: boolean;
};

interface SpotlightPosition {
    x: number;
    y: number;
    r: number;
}

// DOM要素キャッシュの型定義
interface CachedElements {
    board: HTMLElement | null;
    catMain: HTMLElement | null;
    catA: HTMLElement | null;
    catB: HTMLElement | null;
    spotlightL: HTMLElement | null;
    spotlightR: HTMLElement | null;
}

// キャラクター設定の型定義
interface CharacterConfig {
    offsetX: number;
    offsetY: number;
    finalPositionY: number;
    amplitude?: number;
    frequency?: number;
    bounceFactor?: number;
}

// スポットライト設定の型定義
interface SpotlightConfig {
    offsetTop: number;
    offsetRight?: number;
    offsetLeft?: number;
}

// デバイス設定の型定義
interface DeviceConfig {
    catA: CharacterConfig;
    catB: CharacterConfig;
    spotlightR: SpotlightConfig;
    spotlightL: SpotlightConfig;
}

// catPositionConfigの型定義
type CatPositionConfig = Record<string, DeviceConfig>;

// 型付きconfig
const typedConfig = catPositionConfig as CatPositionConfig;

// アニメーションパラメータの型定義
interface AnimationParams {
    amplitude: number;
    frequency: number;
    bounceFactor: number;
    finalPositionY: number;
}

// デバイス別パラメータ範囲定数
const DEVICE_PARAM_RANGES: Record<string, {
    minY: number;
    maxY: number;
    minAmplitude: number;
    maxAmplitude: number;
    minFrequency: number;
    maxFrequency: number;
    minBounce: number;
    maxBounce: number;
}> = {
    'mobile-portrait': {
        minY: 8, maxY: 9,
        minAmplitude: 2, maxAmplitude: 12,
        minFrequency: 0.005, maxFrequency: 0.08,
        minBounce: 0.5, maxBounce: 0.7
    },
    'mobile-landscape': {
        minY: 8, maxY: 17,
        minAmplitude: 3, maxAmplitude: 15,
        minFrequency: 0.005, maxFrequency: 0.08,
        minBounce: 0.5, maxBounce: 0.7
    },
    'tablet-portrait': {
        minY: 8, maxY: 9,
        minAmplitude: 2, maxAmplitude: 12,
        minFrequency: 0.005, maxFrequency: 0.08,
        minBounce: 0.5, maxBounce: 0.7
    },
    'tablet-landscape': {
        minY: 7, maxY: 13,
        minAmplitude: 8, maxAmplitude: 18,
        minFrequency: 0.005, maxFrequency: 0.08,
        minBounce: 0.5, maxBounce: 0.7
    },
    'desktop': {
        minY: 50, maxY: 75,
        minAmplitude: 8, maxAmplitude: 25,
        minFrequency: 0.003, maxFrequency: 0.08,
        minBounce: 0.45, maxBounce: 0.75
    }
};

// パラメータ計算関数群（モジュールレベル）

function normalizePosition(finalPositionY: number, minY: number, maxY: number): number {
    if (maxY === minY) return 0.5;
    const normalized = (finalPositionY - minY) / (maxY - minY);
    return Math.max(0, Math.min(1, normalized));
}

function calculateAmplitude(normalizedY: number, minAmplitude: number, maxAmplitude: number): number {
    return minAmplitude + (maxAmplitude - minAmplitude) * normalizedY;
}

function calculateFrequency(normalizedY: number, minFrequency: number, maxFrequency: number): number {
    return maxFrequency - (maxFrequency - minFrequency) * normalizedY;
}

function calculateBounceFactor(normalizedY: number, minBounce: number, maxBounce: number): number {
    return minBounce + (maxBounce - minBounce) * normalizedY;
}

function getAnimationParams(config: CharacterConfig, deviceKey: string): AnimationParams {
    const finalPositionY = config.finalPositionY;

    if (config.amplitude !== undefined &&
        config.frequency !== undefined &&
        config.bounceFactor !== undefined) {
        return {
            amplitude: config.amplitude,
            frequency: config.frequency,
            bounceFactor: config.bounceFactor,
            finalPositionY,
        };
    }

    const ranges = DEVICE_PARAM_RANGES[deviceKey] || DEVICE_PARAM_RANGES['desktop'];

    if (ranges.minY === ranges.maxY) {
        return {
            amplitude: (ranges.minAmplitude + ranges.maxAmplitude) / 2,
            frequency: (ranges.minFrequency + ranges.maxFrequency) / 2,
            bounceFactor: (ranges.minBounce + ranges.maxBounce) / 2,
            finalPositionY,
        };
    }

    const normalizedY = normalizePosition(finalPositionY, ranges.minY, ranges.maxY);
    return {
        amplitude: calculateAmplitude(normalizedY, ranges.minAmplitude, ranges.maxAmplitude),
        frequency: calculateFrequency(normalizedY, ranges.minFrequency, ranges.maxFrequency),
        bounceFactor: calculateBounceFactor(normalizedY, ranges.minBounce, ranges.maxBounce),
        finalPositionY,
    };
}

// デバイス判定（モジュールレベル関数）
function getDeviceInfo() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth <= 428;
    const isTablet = isTouchDevice && window.innerWidth > 428 && window.innerWidth <= 1280;
    const isMobileOrTablet = isTouchDevice && window.innerWidth <= 1280;
    return { isTouchDevice, isMobile, isTablet, isMobileOrTablet };
}

function getDeviceConfigKey(): string {
    const isPortrait = window.innerHeight > window.innerWidth;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);

    if (shortSide <= 428) {
        return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
    } else if (isTouchDevice && longSide <= 1280) {
        return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
    }
    return 'desktop';
}

export default function WelcomeJS({ isDarkMode }: Props) {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [overlayVisible, setOverlayVisible] = useState(false);

    const spotlightsRef = useRef<SpotlightPosition[]>([]);
    const updateSpotlightCallbackRef = useRef<((spots: SpotlightPosition[]) => void) | null>(null);

    // DOM要素キャッシュ
    const elementsRef = useRef<CachedElements>({
        board: null, catMain: null, catA: null, catB: null,
        spotlightL: null, spotlightR: null,
    });

    // IntersectionObserver用: welcomeセクションが表示中かどうか
    const isVisibleRef = useRef(true);

    // DOM要素をキャッシュする関数
    const cacheElements = useCallback(() => {
        elementsRef.current = {
            board: document.querySelector('.cac-board') as HTMLElement | null,
            catMain: document.querySelector('.cac-cat-main') as HTMLElement | null,
            catA: document.querySelector('.catA') as HTMLElement | null,
            catB: document.querySelector('.catB') as HTMLElement | null,
            spotlightL: document.querySelector('.spotlightL') as HTMLElement | null,
            spotlightR: document.querySelector('.spotlightR') as HTMLElement | null,
        };
    }, []);

    // スポットライト位置を更新する関数
    const updateSpotlightPositions = useCallback(() => {
        const { spotlightL, spotlightR } = elementsRef.current;
        if (!spotlightL || !spotlightR) return;

        const getSpotPosition = (element: HTMLElement): SpotlightPosition => {
            const rect = element.getBoundingClientRect();
            return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: rect.width / 2 };
        };

        const LLSpot = getSpotPosition(spotlightL);
        const LRSpot = getSpotPosition(spotlightR);

        if (spotlightsRef.current.length >= 3) {
            spotlightsRef.current[1] = LLSpot;
            spotlightsRef.current[2] = LRSpot;
            if (updateSpotlightCallbackRef.current) {
                updateSpotlightCallbackRef.current(spotlightsRef.current);
            }
        }
    }, []);

    // 要素の位置を更新する関数
    const updatePosition = useCallback(() => {
        let { board, catMain, catA, catB, spotlightL, spotlightR } = elementsRef.current;

        if (!board || !catMain) {
            cacheElements();
            ({ board, catMain, catA, catB, spotlightL, spotlightR } = elementsRef.current);
        }

        const { isMobileOrTablet } = getDeviceInfo();
        const deviceKey = getDeviceConfigKey();
        const config = typedConfig[deviceKey];

        if (catA && spotlightR && config) {
            const catARect = catA.getBoundingClientRect();
            const spotlightRConfig = config.spotlightR;
            spotlightR.style.top = `${catARect.bottom - catARect.height * 0.5 + spotlightRConfig.offsetTop}px`;
            spotlightR.style.right = `${spotlightRConfig.offsetRight ?? 0}px`;
        }

        if (catB && spotlightL && config) {
            const catBRect = catB.getBoundingClientRect();
            const spotlightLConfig = config.spotlightL;
            spotlightL.style.top = `${catBRect.bottom - catBRect.height * 0.5 + spotlightLConfig.offsetTop}px`;
            spotlightL.style.left = `${spotlightLConfig.offsetLeft ?? 0}px`;
        }

        if (!catMain || !board) return;

        const rect = catMain.getBoundingClientRect();
        const handX = window.scrollX + rect.left - rect.width * 0.04;
        const handY = window.scrollY + rect.top + rect.height * 0.25;

        board.style.left = `${handX}px`;
        board.style.top = `${handY}px`;

        if (isMobileOrTablet) {
            board.style.transformOrigin = 'center bottom';
        }

        updateSpotlightPositions();
    }, [updateSpotlightPositions, cacheElements]);

    // ボードのアニメーション（クリーンアップ付き）
    const animateBoard = useCallback((board: HTMLElement | null) => {
        if (!board) return () => {};

        const angle = 5;
        let angleValue = -angle - 35;
        let direction = 1;
        let animationId: number | null = null;

        const animate = () => {
            if (!isVisibleRef.current) {
                animationId = requestAnimationFrame(animate);
                return;
            }

            angleValue += direction * 0.01;
            if (angleValue > angle - 35 || angleValue < -angle - 35) {
                direction *= -1;
            }

            board.style.transform = `rotate(${angleValue}deg)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => {
            if (animationId !== null) cancelAnimationFrame(animationId);
        };
    }, []);

    // キャラクターのアニメーション作成（クリーンアップ付き）
    const createAnimation = useCallback((
        element: HTMLElement,
        characterName: 'catA' | 'catB'
    ) => {
        let currentDeviceKey = getDeviceConfigKey();
        let currentIsPortrait = currentDeviceKey.includes('portrait');
        let currentConfig = typedConfig[currentDeviceKey][characterName];

        let baseOffsetX = currentConfig.offsetX;
        let baseOffsetY = currentConfig.offsetY;
        let params = getAnimationParams(currentConfig, currentDeviceKey);

        let adjustedFinalPositionY = currentIsPortrait ? params.finalPositionY / 2 : params.finalPositionY;
        let adjustedAmplitude = currentIsPortrait ? params.amplitude / 1.5 : params.amplitude;

        const gravity = 0.8;
        let positionY = currentIsPortrait ? -500 : -1150;
        let velocity = 0;
        let angle = -1;
        let isBouncing = true;
        let animationId: number | null = null;

        let localFrameCounter = 0;
        const shouldUpdatePosition = characterName === 'catA';
        const POSITION_UPDATE_INTERVAL = 2;

        const startAnimation = () => {
            // 非表示時はスキップ（rAFループは維持して再開をスムーズに）
            if (!isVisibleRef.current) {
                animationId = requestAnimationFrame(startAnimation);
                return;
            }

            velocity += gravity;
            positionY += velocity;

            if (positionY >= adjustedFinalPositionY) {
                positionY = adjustedFinalPositionY;
                velocity = -velocity * params.bounceFactor;

                if (Math.abs(velocity) < 1) {
                    isBouncing = false;
                }
            }

            angle += params.frequency;
            const swayOffset = Math.sin(angle) * adjustedAmplitude;

            element.style.transform = `translate(${swayOffset + baseOffsetX}px, ${positionY + baseOffsetY}px)`;

            if (shouldUpdatePosition) {
                localFrameCounter++;
                if (localFrameCounter >= POSITION_UPDATE_INTERVAL) {
                    localFrameCounter = 0;
                    updatePosition();
                }
            }

            animationId = requestAnimationFrame(startAnimation);
        };

        const onClick = (event: MouseEvent) => {
            const welcome = document.querySelector('.welcome');
            if (!(welcome && welcome.contains(event.target as Node))) return;

            if (animationId !== null) cancelAnimationFrame(animationId);

            velocity = 0;
            positionY = currentIsPortrait ? -500 : -1150;
            isBouncing = true;
            angle = 0;

            animationId = requestAnimationFrame(startAnimation);
        };

        const handleResize = () => {
            const newDeviceKey = getDeviceConfigKey();
            const newIsPortrait = newDeviceKey.includes('portrait');

            if (newDeviceKey !== currentDeviceKey) {
                if (animationId !== null) cancelAnimationFrame(animationId);

                currentDeviceKey = newDeviceKey;
                currentIsPortrait = newIsPortrait;
                currentConfig = typedConfig[newDeviceKey][characterName];

                baseOffsetX = currentConfig.offsetX;
                baseOffsetY = currentConfig.offsetY;

                params = getAnimationParams(currentConfig, currentDeviceKey);
                adjustedFinalPositionY = currentIsPortrait ? params.finalPositionY / 2 : params.finalPositionY;
                adjustedAmplitude = currentIsPortrait ? params.amplitude / 1.5 : params.amplitude;

                velocity = 0;
                positionY = currentIsPortrait ? -500 : -1150;
                isBouncing = true;
                angle = 0;

                animationId = requestAnimationFrame(startAnimation);
            }
        };

        window.addEventListener('click', onClick);
        window.addEventListener('resize', handleResize);
        animationId = requestAnimationFrame(startAnimation);

        return () => {
            window.removeEventListener('click', onClick);
            window.removeEventListener('resize', handleResize);
            if (animationId !== null) cancelAnimationFrame(animationId);
        };
    }, [updatePosition]);

    // IntersectionObserverでwelcomeセクションの可視状態を監視
    useEffect(() => {
        const welcome = document.querySelector('.welcome');
        if (!welcome) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting;
            },
            { threshold: 0 }
        );

        observer.observe(welcome);
        return () => observer.disconnect();
    }, []);

    // ウィンドウサイズの監視
    useEffect(() => {
        let resizeThrottleTimer: ReturnType<typeof setTimeout> | null = null;
        const RESIZE_THROTTLE_MS = 16;

        const handleResize = () => {
            if (resizeThrottleTimer) return;

            resizeThrottleTimer = setTimeout(() => {
                resizeThrottleTimer = null;
                setWindowSize({ width: window.innerWidth, height: window.innerHeight });
                cacheElements();
                updatePosition();
            }, RESIZE_THROTTLE_MS);
        };

        const handleOrientationChange = () => {
            let retryCount = 0;
            const MAX_RETRIES = 60;

            const checkSize = () => {
                retryCount++;
                if (retryCount > MAX_RETRIES) return;

                const currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
                const screenOrientation = screen.orientation?.type.includes('portrait') ? 'portrait' : 'landscape';

                if (currentOrientation === screenOrientation) {
                    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
                    cacheElements();
                    updatePosition();
                } else {
                    requestAnimationFrame(checkSize);
                }
            };
            requestAnimationFrame(checkSize);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            if (resizeThrottleTimer) clearTimeout(resizeThrottleTimer);
        };
    }, [updatePosition, cacheElements]);

    // キャラクターとボードのアニメーション設定（クリーンアップ使用）
    useEffect(() => {
        cacheElements();

        const { board, catMain, catA, catB } = elementsRef.current;
        const cacLogo = document.querySelector('.cac-logoL') as HTMLElement | null;
        const cleanups: (() => void)[] = [];

        if (catA && catB) {
            catA.classList.remove('del');
            cleanups.push(createAnimation(catA, 'catA'));

            catB.classList.remove('del');
            cleanups.push(createAnimation(catB, 'catB'));
        }

        if (board && catMain && cacLogo) {
            catMain.classList.remove('del');
            cacLogo.classList.remove('del');
            board.classList.remove('del');
            cleanups.push(animateBoard(board));
        }

        window.addEventListener('load', updatePosition);
        setTimeout(updatePosition, 100);

        return () => {
            window.removeEventListener('load', updatePosition);
            cleanups.forEach(cleanup => cleanup());
        };
    }, [createAnimation, animateBoard, updatePosition, cacheElements]);

    // スポットライトエフェクト
    useEffect(() => {
        let mouseSpot: SpotlightPosition = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            r: 0
        };
        let lastMousePosition = { x: 0, y: 0 };
        let isAnimating = false;
        let touchStartPos = { x: 0, y: 0 };
        let animationFrameId: number | null = null;
        let initialized = false;
        const canvas = document.getElementById('spotlightCanvas') as HTMLCanvasElement | null;
        const ctx = canvas?.getContext('2d');

        const { isMobileOrTablet } = getDeviceInfo();

        const onMouseMove = (e: MouseEvent) => {
            if (!isDarkMode) return;

            const dx = e.clientX - lastMousePosition.x;
            const dy = e.clientY - lastMousePosition.y;
            if (Math.sqrt(dx * dx + dy * dy) < 2) return;

            lastMousePosition = { x: e.clientX, y: e.clientY };
            mouseSpot = { x: e.clientX, y: e.clientY, r: window.innerHeight / 2 };
            spotlightsRef.current[0] = mouseSpot;

            if (isAnimating) return;
            isAnimating = true;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                drawSpotlights(spotlightsRef.current);
                isAnimating = false;
            });
        };

        const onTouchStart = (e: TouchEvent) => {
            if (!isDarkMode) return;
            touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (!isDarkMode) return;

            const touchEndPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
            const dx = touchEndPos.x - touchStartPos.x;
            const dy = touchEndPos.y - touchStartPos.y;

            if (Math.sqrt(dx * dx + dy * dy) <= 10) {
                const welcome = document.querySelector('.welcome');
                if (welcome && welcome.contains(e.target as Node)) {
                    e.preventDefault();
                    setOverlayVisible(prev => !prev);
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!isDarkMode || isMobileOrTablet) return;

            const touch = e.touches[0];
            const dx = touch.clientX - lastMousePosition.x;
            const dy = touch.clientY - lastMousePosition.y;
            if (Math.sqrt(dx * dx + dy * dy) < 2) return;

            lastMousePosition = { x: touch.clientX, y: touch.clientY };
            mouseSpot = { x: touch.clientX, y: touch.clientY, r: window.innerHeight / 2 };
            spotlightsRef.current[0] = mouseSpot;

            if (isAnimating) return;
            isAnimating = true;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(() => {
                drawSpotlights(spotlightsRef.current);
                isAnimating = false;
            });
        };

        const onResize = () => {
            resizeCanvas();
            if (isDarkMode) drawSpotlights(spotlightsRef.current);
        };

        const removeListeners = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', onResize);
        };

        const resizeCanvas = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        let lastDrawnSpots: SpotlightPosition[] = [];

        const drawSpotlights = (spots: SpotlightPosition[]) => {
            if (!ctx || !canvas) return;

            if (!isDarkMode) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const { isMobileOrTablet: isMobileDevice } = getDeviceInfo();
            if (isMobileDevice && !overlayVisible) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            const hasSignificantChange = spots.some((spot, i) => {
                const lastSpot = lastDrawnSpots[i];
                if (!lastSpot) return true;
                return Math.abs(spot.x - lastSpot.x) > 1 ||
                       Math.abs(spot.y - lastSpot.y) > 1 ||
                       Math.abs(spot.r - lastSpot.r) > 1;
            });

            if (!hasSignificantChange && lastDrawnSpots.length === spots.length) return;

            lastDrawnSpots = spots.map(s => ({ ...s }));

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            spots.forEach((spot) => {
                ctx.beginPath();
                ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';
        };

        const initializeSpotlight = () => {
            if (!canvas || !ctx) return;

            const spotLightR = document.querySelector('.spotlightR') as HTMLElement | null;
            const spotLightL = document.querySelector('.spotlightL') as HTMLElement | null;
            if (!spotLightR || !spotLightL) return;

            const getSpotPosition = (element: HTMLElement): SpotlightPosition => {
                const rect = element.getBoundingClientRect();
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, r: rect.width / 2 };
            };

            spotlightsRef.current = [mouseSpot, getSpotPosition(spotLightL), getSpotPosition(spotLightR)];
            updateSpotlightCallbackRef.current = drawSpotlights;

            resizeCanvas();
            drawSpotlights(spotlightsRef.current);

            if (isMobileOrTablet) {
                window.addEventListener('touchstart', onTouchStart);
                window.addEventListener('touchend', onTouchEnd);
            } else {
                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('touchmove', onTouchMove);
            }

            window.addEventListener('resize', onResize);
            initialized = true;
        };

        if (isDarkMode && !initialized) {
            initializeSpotlight();
        } else if (!isDarkMode) {
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
            spotlightsRef.current = [];
            updateSpotlightCallbackRef.current = null;
            initialized = false;
        }

        updatePosition();

        return () => {
            removeListeners();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
    }, [isDarkMode, windowSize, overlayVisible, updatePosition]);

    return <></>;
}
