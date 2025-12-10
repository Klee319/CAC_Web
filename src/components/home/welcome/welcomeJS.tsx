import "./welcome.css";
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
        minY: 8,
        maxY: 9,
        minAmplitude: 2,
        maxAmplitude: 12,
        minFrequency: 0.005,
        maxFrequency: 0.08,
        minBounce: 0.5,
        maxBounce: 0.7
    },
    'mobile-landscape': {
        minY: 8,
        maxY: 17,
        minAmplitude: 3,
        maxAmplitude: 15,
        minFrequency: 0.005,
        maxFrequency: 0.08,
        minBounce: 0.5,
        maxBounce: 0.7
    },
    'tablet-portrait': {
        minY: 8,
        maxY: 9,
        minAmplitude: 2,
        maxAmplitude: 12,
        minFrequency: 0.005,
        maxFrequency: 0.08,
        minBounce: 0.5,
        maxBounce: 0.7
    },
    'tablet-landscape': {
        minY: 7,
        maxY: 13,
        minAmplitude: 8,
        maxAmplitude: 18,
        minFrequency: 0.005,
        maxFrequency: 0.08,
        minBounce: 0.5,
        maxBounce: 0.7
    },
    'desktop': {
        minY: 50,
        maxY: 75,
        minAmplitude: 8,
        maxAmplitude: 25,
        minFrequency: 0.003,
        maxFrequency: 0.08,
        minBounce: 0.45,
        maxBounce: 0.75
    }
};

// パラメータ計算関数群

/**
 * Y座標を0.0〜1.0の範囲に正規化する
 */
function normalizePosition(
    finalPositionY: number,
    minY: number,
    maxY: number
): number {
    // ゼロ除算を回避（minY === maxYの場合）
    if (maxY === minY) {
        return 0.5; // 中間値を返す
    }

    // 正規化計算
    const normalized = (finalPositionY - minY) / (maxY - minY);

    // 0.0〜1.0の範囲にクランプ
    return Math.max(0, Math.min(1, normalized));
}

/**
 * 正規化されたY座標に基づいて揺れの振幅を計算する
 */
function calculateAmplitude(
    normalizedY: number,
    minAmplitude: number,
    maxAmplitude: number
): number {
    return minAmplitude + (maxAmplitude - minAmplitude) * normalizedY;
}

/**
 * 正規化されたY座標に基づいて揺れの周波数を計算する
 */
function calculateFrequency(
    normalizedY: number,
    minFrequency: number,
    maxFrequency: number
): number {
    return maxFrequency - (maxFrequency - minFrequency) * normalizedY;
}

/**
 * 正規化されたY座標に基づいてバウンド係数を計算する
 */
function calculateBounceFactor(
    normalizedY: number,
    minBounce: number,
    maxBounce: number
): number {
    return minBounce + (maxBounce - minBounce) * normalizedY;
}

/**
 * アニメーションパラメータを統合的に計算する
 */
function getAnimationParams(
    config: CharacterConfig,
    deviceKey: string
): AnimationParams {
    const finalPositionY = config.finalPositionY;

    // 設定ファイルに明示的にパラメータが存在する場合はそれを使用
    if (config.amplitude !== undefined &&
        config.frequency !== undefined &&
        config.bounceFactor !== undefined) {
        return {
            amplitude: config.amplitude,
            frequency: config.frequency,
            bounceFactor: config.bounceFactor,
            finalPositionY: finalPositionY,
        };
    }

    // デバイス固有のパラメータ範囲を取得
    const ranges = DEVICE_PARAM_RANGES[deviceKey] || DEVICE_PARAM_RANGES['desktop'];

    // minY === maxYの場合の特別処理（tablet, desktop等）
    if (ranges.minY === ranges.maxY) {
        // 固定値を返す（中間値を使用）
        return {
            amplitude: (ranges.minAmplitude + ranges.maxAmplitude) / 2,
            frequency: (ranges.minFrequency + ranges.maxFrequency) / 2,
            bounceFactor: (ranges.minBounce + ranges.maxBounce) / 2,
            finalPositionY: finalPositionY,
        };
    }

    // Y座標を正規化
    const normalizedY = normalizePosition(finalPositionY, ranges.minY, ranges.maxY);

    // 各パラメータを計算
    const amplitude = calculateAmplitude(normalizedY, ranges.minAmplitude, ranges.maxAmplitude);
    const frequency = calculateFrequency(normalizedY, ranges.minFrequency, ranges.maxFrequency);
    const bounceFactor = calculateBounceFactor(normalizedY, ranges.minBounce, ranges.maxBounce);

    return {
        amplitude,
        frequency,
        bounceFactor,
        finalPositionY,
    };
}

export default function WelcomeJS({ isDarkMode }: Props) {
    // ウィンドウサイズの状態管理
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    // オーバーレイ表示状態（モバイル/タブレット用）
    const [overlayVisible, setOverlayVisible] = useState(false);

    // スポットライト配列の参照
    const spotlightsRef = useRef<SpotlightPosition[]>([]);
    const updateSpotlightCallbackRef = useRef<((spots: SpotlightPosition[]) => void) | null>(null);

    // DOM要素キャッシュ（querySelector呼び出しを削減）
    const elementsRef = useRef<CachedElements>({
        board: null,
        catMain: null,
        catA: null,
        catB: null,
        spotlightL: null,
        spotlightR: null,
    });

    // フレームカウンター（フレームスキップ用）
    const frameCounterRef = useRef(0);

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

    // デバイス判定の共通化関数（タッチデバイス検知）
    const getDeviceInfo = () => {
        // タッチデバイスかどうかを判定
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // スマホサイズかどうか
        const isMobile = window.innerWidth <= 428;

        // タブレットサイズかどうか（タッチデバイスかつスマホより大きい）
        const isTablet = isTouchDevice && window.innerWidth > 428 && window.innerWidth <= 1280;

        // タッチデバイス全般（モバイル/タブレット）
        const isMobileOrTablet = isTouchDevice && window.innerWidth <= 1280;

        return { isTouchDevice, isMobile, isTablet, isMobileOrTablet };
    };

    // デバイスタイプとオリエンテーションを判定してJSON設定キーを取得
    const getDeviceConfigKey = () => {
        const isPortrait = window.innerHeight > window.innerWidth;
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // 短辺を基準にデバイス判定
        const shortSide = Math.min(width, height);
        const longSide = Math.max(width, height);

        if (shortSide <= 428) {
            // モバイル: 短辺が428px以下
            return isPortrait ? 'mobile-portrait' : 'mobile-landscape';
        } else if (isTouchDevice && longSide <= 1280) {
            // タブレット: タッチデバイスかつ長辺が1280px以下
            return isPortrait ? 'tablet-portrait' : 'tablet-landscape';
        } else {
            return 'desktop';
        }
    };

    // スポットライト位置を更新する関数（キャッシュ使用）
    const updateSpotlightPositions = useCallback(() => {
        const { spotlightL, spotlightR } = elementsRef.current;

        if (!spotlightL || !spotlightR) return;

        const getSpotPosition = (element: HTMLElement): SpotlightPosition => {
            const rect = element.getBoundingClientRect();
            // Canvas描画用はビューポート相対座標なのでscrollは不要
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                r: rect.width / 2,
            };
        };

        const LLSpot = getSpotPosition(spotlightL);
        const LRSpot = getSpotPosition(spotlightR);

        // スポットライト配列を更新（インデックス1と2）
        if (spotlightsRef.current.length >= 3) {
            spotlightsRef.current[1] = LLSpot;
            spotlightsRef.current[2] = LRSpot;

            // 描画コールバックが登録されていれば呼び出し
            if (updateSpotlightCallbackRef.current) {
                updateSpotlightCallbackRef.current(spotlightsRef.current);
            }
        }
    }, []);

    // 要素の位置を更新する関数（キャッシュ使用・最適化版）
    const updatePosition = useCallback(() => {
        // キャッシュから要素を取得（キャッシュがなければ取得）
        let { board, catMain, catA, catB, spotlightL, spotlightR } = elementsRef.current;

        // キャッシュが空の場合は再取得
        if (!board || !catMain) {
            cacheElements();
            ({ board, catMain, catA, catB, spotlightL, spotlightR } = elementsRef.current);
        }

        const { isMobileOrTablet } = getDeviceInfo();

        // JSON設定からデバイス固有の設定を取得
        const deviceKey = getDeviceConfigKey();
        const config = (catPositionConfig as any)[deviceKey];

        // キャラクターAとスポットライトRの位置調整
        if (catA && spotlightR && config) {
            const catARect = catA.getBoundingClientRect();
            const spotlightRConfig = config.spotlightR;
            spotlightR.style.top = `${catARect.bottom - catARect.height * 0.5 + spotlightRConfig.offsetTop}px`;
            spotlightR.style.right = `${spotlightRConfig.offsetRight}px`;
        }

        // キャラクターBとスポットライトLの位置調整
        if (catB && spotlightL && config) {
            const catBRect = catB.getBoundingClientRect();
            const spotlightLConfig = config.spotlightL;
            spotlightL.style.top = `${catBRect.bottom - catBRect.height * 0.5 + spotlightLConfig.offsetTop}px`;
            spotlightL.style.left = `${spotlightLConfig.offsetLeft}px`;
        }

        // メインキャラクターとボードの位置調整
        if (!catMain || !board) return;

        const rect = catMain.getBoundingClientRect();

        // PC/モバイル共通の位置計算
        const handX = window.scrollX + rect.left - rect.width * 0.04;
        const handY = window.scrollY + rect.top + rect.height * 0.25;

        board.style.left = `${handX}px`;
        board.style.top = `${handY}px`;

        if (isMobileOrTablet) {
            // transform-originをPC版と同じに設定
            board.style.transformOrigin = 'center bottom';
        }

        // スポットライト位置も更新
        updateSpotlightPositions();
    }, [updateSpotlightPositions, cacheElements]);

    // ボードのアニメーション
    const animateBoard = useCallback((board: HTMLElement | null) => {
        if (!board) return;

        const angle = 5;
        let angleValue = -angle - 35;
        let direction = 1;

        const animate = () => {
            if (!board) return;

            angleValue += direction * 0.01;
            if (angleValue > angle - 35 || angleValue < -angle - 35) {
                direction *= -1;
            }

            board.style.transform = `rotate(${angleValue}deg)`;
            requestAnimationFrame(animate);
        };

        animate();
    }, []);

    // キャラクターのアニメーション作成
    const createAnimation = useCallback((
        element: HTMLElement,
        characterName: 'catA' | 'catB'  // キャラクター名を受け取る
    ) => {
        let currentDeviceKey = getDeviceConfigKey();
        let currentIsPortrait = currentDeviceKey.includes('portrait');

        // 現在のデバイスキーに応じたconfigを取得
        let currentConfig = (catPositionConfig as any)[currentDeviceKey][characterName];

        // オフセット値を取得
        let baseOffsetX = currentConfig.offsetX;
        let baseOffsetY = currentConfig.offsetY;

        // パラメータを計算または設定ファイルから取得（デバイスキーベース）
        let params = getAnimationParams(currentConfig, currentDeviceKey);

        // portraitモード時のみfinalPositionYとamplitudeを調整
        let adjustedFinalPositionY = currentIsPortrait ? params.finalPositionY / 2 : params.finalPositionY;
        let adjustedAmplitude = currentIsPortrait ? params.amplitude / 1.5 : params.amplitude;

        // 重力加速度（マイルドなバウンド演出のため低めに設定）
        const gravity = 0.8;

        // 初期位置をportraitモード時のみ調整
        let positionY = currentIsPortrait ? -500 : -1150;
        let velocity = 0;
        let angle = -1;
        let isBouncing = true;
        let animationId: number | null = null;

        // フレームスキップ用カウンター（位置更新の頻度制御）
        let localFrameCounter = 0;
        // catAのみが位置更新を担当（重複呼び出し防止）
        const shouldUpdatePosition = characterName === 'catA';
        // 位置更新の間隔（2フレームに1回 = 約30fps相当の位置更新）
        const POSITION_UPDATE_INTERVAL = 2;

        // アニメーションの開始
        const startAnimation = () => {
            velocity += gravity;
            positionY += velocity;

            if (positionY >= adjustedFinalPositionY) {
                positionY = adjustedFinalPositionY;
                velocity = -velocity * params.bounceFactor; // 計算されたバウンド係数を使用

                if (Math.abs(velocity) < 1) {
                    isBouncing = false;
                }
            }

            angle += params.frequency; // 計算された周波数を使用
            const swayOffset = Math.sin(angle) * adjustedAmplitude;

            element.style.transform = `translate(${swayOffset + baseOffsetX}px, ${positionY + baseOffsetY}px)`;

            // フレームスキップ: catAのみが位置更新を担当し、N フレームに1回だけ更新
            if (shouldUpdatePosition) {
                localFrameCounter++;
                if (localFrameCounter >= POSITION_UPDATE_INTERVAL) {
                    localFrameCounter = 0;
                    updatePosition();
                }
            }

            animationId = requestAnimationFrame(startAnimation);
        };

        // クリックイベントハンドラ
        const onClick = (event: MouseEvent) => {
            const welcome = document.querySelector('.welcome');
            if (!(welcome && welcome.contains(event.target as Node))) {
                return;
            }

            if (animationId !== null) cancelAnimationFrame(animationId);

            velocity = 0;
            positionY = currentIsPortrait ? -500 : -1150; // portraitモード時は初期位置を調整
            isBouncing = true;
            angle = 0;

            animationId = requestAnimationFrame(startAnimation);
        };

        // リサイズイベントハンドラ
        const handleResize = () => {
            // orientationchange経由でない通常のresizeのみ処理
            // （orientationchangeは別途ハンドラで処理されるため）
            const newDeviceKey = getDeviceConfigKey();
            const newIsPortrait = newDeviceKey.includes('portrait');

            // デバイスキーが変わった場合に再調整
            if (newDeviceKey !== currentDeviceKey) {
                if (animationId !== null) cancelAnimationFrame(animationId);

                // 現在のデバイスキーとパラメータを更新
                currentDeviceKey = newDeviceKey;
                currentIsPortrait = newIsPortrait;

                // 新しいデバイスキーに応じた新しいconfigを取得
                currentConfig = (catPositionConfig as any)[newDeviceKey][characterName];

                // オフセット値を更新
                baseOffsetX = currentConfig.offsetX;
                baseOffsetY = currentConfig.offsetY;

                params = getAnimationParams(currentConfig, currentDeviceKey);
                adjustedFinalPositionY = currentIsPortrait ? params.finalPositionY / 2 : params.finalPositionY;
                adjustedAmplitude = currentIsPortrait ? params.amplitude / 1.5 : params.amplitude;

                // アニメーション状態をリセット
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

    // ウィンドウサイズの監視（リサイズ時に位置更新・throttle適用）
    useEffect(() => {
        let resizeThrottleTimer: ReturnType<typeof setTimeout> | null = null;
        const RESIZE_THROTTLE_MS = 16; // 約60fps相当

        const handleResize = () => {
            if (resizeThrottleTimer) return; // throttle中はスキップ

            resizeThrottleTimer = setTimeout(() => {
                resizeThrottleTimer = null;
                setWindowSize({
                    width: window.innerWidth,
                    height: window.innerHeight,
                });
                // キャッシュをクリア（リサイズ後は再取得が必要な場合がある）
                cacheElements();
                updatePosition();
            }, RESIZE_THROTTLE_MS);
        };

        // orientationchange時はwindowサイズ更新を待つ
        const handleOrientationChange = () => {
            // windowサイズが更新されるまで待機
            const checkSize = () => {
                const currentOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
                const screenOrientation = screen.orientation?.type.includes('portrait') ? 'portrait' : 'landscape';

                // windowサイズとscreen.orientationが一致するまで待機
                if (currentOrientation === screenOrientation) {
                    setWindowSize({
                        width: window.innerWidth,
                        height: window.innerHeight,
                    });
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

    // キャラクターとボードのアニメーション設定
    useEffect(() => {
        // DOM要素をキャッシュ
        cacheElements();

        const { board, catMain, catA, catB } = elementsRef.current;
        const cacLogo = document.querySelector('.cac-logoL') as HTMLElement | null;

        // JSON設定からデバイス固有の設定を取得
        const deviceKey = getDeviceConfigKey();
        const config = (catPositionConfig as any)[deviceKey];

        // キャラクターのアニメーション設定
        if (catA && catB && config) {
            catA.classList.remove('del');
            createAnimation(catA, 'catA');

            catB.classList.remove('del');
            createAnimation(catB, 'catB');
        }

        // ボードとメインキャラクターの表示とアニメーション
        if (board && catMain && cacLogo) {
            catMain.classList.remove('del');
            cacLogo.classList.remove('del');
            board.classList.remove('del');
            animateBoard(board);
        }

        window.addEventListener('load', updatePosition);

        // 初期表示時に位置を更新（少し遅延させて要素のレンダリングを待つ）
        setTimeout(updatePosition, 100);

        return () => {
            window.removeEventListener('load', updatePosition);
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

        // マウス移動時のハンドラ（PC用 - 高フレームレート）
        const onMouseMove = (e: MouseEvent) => {
            if (!isDarkMode) return;

            // 移動距離が閾値（2px）以上の場合のみ更新
            const dx = e.clientX - lastMousePosition.x;
            const dy = e.clientY - lastMousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) return;

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

        // タッチ開始時のハンドラ（モバイル/タブレット用）
        const onTouchStart = (e: TouchEvent) => {
            if (!isDarkMode) return;
            touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        };

        // タッチ終了時のハンドラ（モバイル/タブレット用 - オーバーレイトグル）
        const onTouchEnd = (e: TouchEvent) => {
            if (!isDarkMode) return;

            const touchEndPos = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            // 移動距離が10px以内ならタップとみなす
            const dx = touchEndPos.x - touchStartPos.x;
            const dy = touchEndPos.y - touchStartPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 10) {
                // welcomeエリア内のタップの場合、オーバーレイ表示をトグル
                const welcome = document.querySelector('.welcome');
                if (welcome && welcome.contains(e.target as Node)) {
                    e.preventDefault(); // クリックイベントの発火を防止
                    setOverlayVisible(prev => !prev);
                }
            }
        };

        // タッチ移動時のハンドラ（PC用タッチデバイス対応 - 高フレームレート）
        const onTouchMove = (e: TouchEvent) => {
            if (!isDarkMode || isMobileOrTablet) return;

            const touch = e.touches[0];
            const dx = touch.clientX - lastMousePosition.x;
            const dy = touch.clientY - lastMousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) return;

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

        // リサイズ時のハンドラ
        const onResize = () => {
            resizeCanvas();
            if (isDarkMode) drawSpotlights(spotlightsRef.current);
        };

        // イベントリスナーの削除
        const removeListeners = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('resize', onResize);
        };

        // キャンバスのリサイズ
        const resizeCanvas = () => {
            if (!canvas) return;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // 前回描画時のスポットライト位置をキャッシュ（差分描画用）
        let lastDrawnSpots: SpotlightPosition[] = [];

        // スポットライトの描画（最適化版）
        const drawSpotlights = (spots: SpotlightPosition[]) => {
            if (!ctx || !canvas) return;

            // ライトモードではオーバーレイを描画しない
            if (!isDarkMode) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            // overlayVisibleがfalse（モバイル/タブレットでオフ）の場合はオーバーレイを描画しない
            // PC版（isMobileOrTabletがfalse）では常に描画する
            const { isMobileOrTablet: isMobileDevice } = getDeviceInfo();
            if (isMobileDevice && !overlayVisible) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            // 位置変化量チェック（微小な変化は再描画スキップ）
            const hasSignificantChange = spots.some((spot, i) => {
                const lastSpot = lastDrawnSpots[i];
                if (!lastSpot) return true;
                const dx = Math.abs(spot.x - lastSpot.x);
                const dy = Math.abs(spot.y - lastSpot.y);
                const dr = Math.abs(spot.r - lastSpot.r);
                return dx > 1 || dy > 1 || dr > 1;
            });

            if (!hasSignificantChange && lastDrawnSpots.length === spots.length) {
                return; // 変化がなければ再描画スキップ
            }

            // 位置をキャッシュ
            lastDrawnSpots = spots.map(s => ({ ...s }));

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalCompositeOperation = 'destination-out';
            // 単色なのでグラデーション不要 - 直接円を描画
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            spots.forEach((spot) => {
                ctx.beginPath();
                ctx.arc(spot.x, spot.y, spot.r, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';
        };

        // スポットライトの初期化
        const initializeSpotlight = () => {
            if (!canvas || !ctx) return;

            const spotLightR = document.querySelector('.spotlightR') as HTMLElement | null;
            const spotLightL = document.querySelector('.spotlightL') as HTMLElement | null;

            if (!spotLightR || !spotLightL) return;

            const getSpotPosition = (element: HTMLElement): SpotlightPosition => {
                const rect = element.getBoundingClientRect();
                // Canvas描画用はビューポート相対座標なのでscrollは不要
                return {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2,
                    r: rect.width / 2,
                };
            };

            const LRSpot = getSpotPosition(spotLightR);
            const LLSpot = getSpotPosition(spotLightL);

            spotlightsRef.current = [mouseSpot, LLSpot, LRSpot];

            // 描画コールバックを登録
            updateSpotlightCallbackRef.current = drawSpotlights;

            resizeCanvas();
            drawSpotlights(spotlightsRef.current);

            // モバイル/タブレットの場合はタッチ操作、PCの場合はマウス操作を有効化
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

        // ダークモードに応じてスポットライトを初期化または削除
        if (isDarkMode && !initialized) {
            initializeSpotlight();
        } else if (!isDarkMode) {
            // ライトモード時はリソースをクリア
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

    // 空のフラグメントを返す（実際のレンダリングはwelcome.tsxで行われる）
    return <></>;
}