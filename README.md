# VisuEmoLink（SecHack365 表現駆動コース　チーム４B）
VisuEmoLinkとは、表情をオフラインと変わらないくらい細かく表現してくれるアバターを用いて会議に参加できるサービスです。カメラから取得した表情を適応した自分の面影があるアバターを使用しZoomやTeamsなどに参加できるように支援することでこれまでのアバターへの概念を変えることを目指しています。

<img width="641" alt="スクリーンショット 2024-03-09 23 36 00" src="https://github.com/mofunyanko/visu-emo-link/assets/95011869/72ba577a-0ff0-47cc-a4a1-8687737d8928">

## 環境構築
前提として、[Node.js](https://nodejs.org/en/download/)と[Python](https://www.python.org/downloads/)（tensorflowの関係上、バージョンは3.7〜3.10のいずれか）がローカルにインストールされている必要があります。

1. リポジトリをcloneする
```
git clone https://github.com/mofunyanko/visu-emo-link.git
```
2. ディレクトリを移動する
```
cd visu-emo-link
```
3. 必要な依存関係をインストールする
```
npm install
```
4. 次にコマンドを実行し、[localhost](http://localhost:3000/)にアクセスする
```
npm run dev
```

### 技術構成
- [ReadyPlyaerMe](https://github.com/readyplayerme/rpm-react-sdk)
- [Vercel](https://vercel.com/)
- [Next.js](https://nextjs.org/)
- [Three.js](https://threejs.org/)
- [MediaPipe Face Landmarker](https://developers.google.com/mediapipe/api/solutions/js/tasks-vision.facelandmarker)
- [face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/index.html)
- [tensorflow](https://www.tensorflow.org/js?hl=ja)
