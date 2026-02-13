# JobMatching システム構成図

> このドキュメントは、JobMatching のシステム構成を **非エンジニアの方にもわかりやすく** まとめたものです。

---

## 1. システム全体の構成

> 💡 JobMatching は「**ブロックチェーン上に実績を記録する**」Web アプリです。
> ユーザーはウォレット（デジタル財布）でログインし、自分の実績を登録すると、
> それがブロックチェーンに **改ざん不可能な証明書（NFT）** として記録されます。

```mermaid
graph TB
    subgraph User["👤 ユーザー"]
        Browser["ブラウザ（Chrome など）"]
        Wallet["ウォレット（Rainbow）<br/>= デジタル財布"]
    end

    subgraph App["📱 JobMatching アプリ"]
        UI["画面表示<br/>（実績一覧・登録フォーム）"]
        Auth["ログイン処理<br/>（ウォレット署名で本人確認）"]
        Logic["実績の管理ロジック<br/>（登録・検証・ミント）"]
    end

    subgraph Cloud["☁️ クラウドサービス"]
        DB["Supabase<br/>= データベース<br/>（実績データを保存）"]
        SDK["Thirdweb SDK<br/>= ブロックチェーン接続ツール"]
    end

    subgraph Chain["⛓️ ブロックチェーン（Base Sepolia）"]
        Contract["NFTコントラクト<br/>= 証明書の発行所"]
        NFT["NFT<br/>= 改ざん不可能な実績証明書"]
    end

    Browser --> UI
    Wallet --> Auth
    UI --> Logic
    Auth --> Logic
    Logic --> DB
    Logic --> SDK
    SDK --> Contract
    Contract --> NFT
```

### 用語解説

| 用語 | 意味 |
|---|---|
| **ウォレット** | 暗号資産を管理するデジタル財布。ログインにも使う |
| **ブロックチェーン** | 改ざんできない分散型の記録台帳 |
| **NFT** | 世界に1つだけのデジタル証明書。コピーや改ざんが不可能 |
| **コントラクト** | ブロックチェーン上で動くプログラム。NFTの発行を担当 |
| **Supabase** | データを保存するクラウドデータベースサービス |
| **Thirdweb** | ブロックチェーンとやり取りするための開発ツール |
| **Base Sepolia** | テスト用のブロックチェーンネットワーク（無料で使える） |

---

## 2. データの構造

> 💡 システムが扱う主なデータは **「ユーザー」** と **「実績」** の2つです。

```mermaid
erDiagram
    USER {
        string walletAddress "ウォレットアドレス（ID代わり）"
        string name "表示名"
        string bio "自己紹介"
        string avatarUrl "アイコン画像"
    }

    ACHIEVEMENT {
        string id "実績ID"
        string userId "誰の実績か"
        string title "実績のタイトル"
        string description "実績の詳細"
        string status "状態（下書き/申請中/認証済み）"
    }

    PROOF {
        string transactionHash "ブロックチェーン上の記録番号"
        number chainId "どのチェーンに記録したか"
        string contractAddress "発行所のアドレス"
        string tokenId "NFTの番号"
    }

    USER ||--o{ ACHIEVEMENT : "実績を持つ"
    ACHIEVEMENT ||--o| PROOF : "認証されるとNFT証明がつく"
```

### 実績のステータス（状態）遷移

```mermaid
stateDiagram-v2
    [*] --> 下書き: 実績を登録
    下書き --> 申請中: 認証を申請
    申請中 --> 認証済み: 審査通過 & NFTミント
    
    note right of 下書き: まだ自分だけが見える状態
    note right of 申請中: 認証者に審査を依頼中
    note right of 認証済み: ブロックチェーンにNFTとして記録済み\n（改ざん不可能な証明書）
```

---

## 3. ログインの仕組み（SIWE認証）

> 💡 一般的なWebサイトは「メールアドレス＋パスワード」でログインしますが、
> このアプリは **ウォレットの署名**（デジタル署名）で本人確認します。
> パスワードの漏洩リスクがなく、より安全です。

```mermaid
sequenceDiagram
    actor User as 👤 ユーザー
    participant Wallet as 🦊 ウォレット<br/>（Rainbow）
    participant App as 📱 アプリ
    participant Auth as 🔐 認証サーバー

    Note over User,Auth: ① ウォレット接続
    User->>App: 「Connect Wallet」をクリック
    App->>Wallet: 接続リクエスト
    Wallet-->>User: 「接続を許可しますか？」
    User->>Wallet: 許可する
    Wallet-->>App: 接続完了 ✅

    Note over User,Auth: ② 署名でログイン
    App->>Auth: ログイン用のメッセージを生成
    Auth-->>App: 「このメッセージに署名してください」
    App->>Wallet: 署名リクエスト
    Wallet-->>User: 「署名しますか？」
    User->>Wallet: 署名する
    Wallet-->>App: 署名データ

    Note over User,Auth: ③ 本人確認
    App->>Auth: 署名を検証
    Auth-->>App: 本人確認OK → ログイン完了 🎉
```

---

## 4. 実績登録からNFT発行までの流れ

> 💡 実績を登録すると、まずデータベースに保存されます。
> 「ミント」ボタンを押すと、その実績がブロックチェーン上に
> **NFT（改ざんできない証明書）** として永久に記録されます。

```mermaid
sequenceDiagram
    actor User as 👤 ユーザー
    participant UI as 📱 画面
    participant DB as 🗄️ データベース<br/>（Supabase）
    participant Chain as ⛓️ ブロックチェーン<br/>（Base Sepolia）

    Note over User,Chain: ① 実績の登録
    User->>UI: タイトルと説明を入力
    UI->>DB: 実績データを保存
    DB-->>UI: 保存完了
    UI-->>User: 「実績が登録されました」✅

    Note over User,Chain: ② NFT ミント（証明書発行）
    User->>UI: 「ミント」ボタンをクリック
    UI->>Chain: NFT発行トランザクションを送信
    Note right of Chain: ブロックチェーンに<br/>永久記録される
    Chain-->>UI: 発行完了（NFT番号を返却）
    UI->>DB: 認証済みステータスに更新
    DB-->>UI: 更新完了
    UI-->>User: 「NFTが発行されました！」🎉

    Note over User,Chain: この NFT は誰にも改ざん・削除できません
```

---

## 5. 技術スタック一覧

> 💡 このアプリを構成している技術の一覧です。

| 役割 | 技術 | ひとことで言うと |
|---|---|---|
| **画面表示** | Next.js + React | Webページを作るフレームワーク |
| **デザイン** | CSS | 見た目のスタイル定義 |
| **ログイン** | RainbowKit + SIWE | ウォレットでログインする仕組み |
| **セッション管理** | NextAuth.js | ログイン状態を維持する仕組み |
| **データ保存** | Supabase | クラウド上のデータベース |
| **ブロックチェーン接続** | Thirdweb SDK | ブロックチェーンとやり取りするツール |
| **NFT 発行** | ERC-721 スマートコントラクト | NFTを発行するプログラム |
| **テスト用チェーン** | Base Sepolia | 無料で使えるテスト環境 |
| **言語** | TypeScript | JavaScript に型安全性を加えた言語 |
