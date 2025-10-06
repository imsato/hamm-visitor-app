/*
  # 来客受付システム用テーブル作成

  1. 新しいテーブル
    - `visitors`
      - `id` (uuid, primary key)
      - `name` (text, 来客者名)
      - `company` (text, 会社名・団体名)
      - `department` (text, 訪問先部署)
      - `contact_person` (text, 担当者名)
      - `purpose` (text, 訪問目的)
      - `phone` (text, 電話番号)
      - `email` (text, メールアドレス, nullable)
      - `visitor_count` (integer, 来客人数)
      - `check_in_time` (timestamptz, 受付時刻)
      - `check_out_time` (timestamptz, 退館時刻, nullable)
      - `status` (text, ステータス: 'checked-in' or 'checked-out')
      - `badge_number` (text, バッジ番号, nullable)
      - `created_at` (timestamptz, 作成日時)
      - `updated_at` (timestamptz, 更新日時)

  2. セキュリティ
    - RLSを有効化
    - 認証されたユーザーが全てのデータにアクセス可能なポリシーを追加
    - 管理者用のポリシー設定
*/

-- 来客者テーブルの作成
CREATE TABLE IF NOT EXISTS visitors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  department text NOT NULL,
  contact_person text NOT NULL,
  purpose text NOT NULL,
  phone text NOT NULL,
  email text,
  visitor_count integer NOT NULL DEFAULT 1,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  status text NOT NULL DEFAULT 'checked-in' CHECK (status IN ('checked-in', 'checked-out')),
  badge_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーが全てのデータを読み取り可能
CREATE POLICY "Authenticated users can read all visitors"
  ON visitors
  FOR SELECT
  TO authenticated
  USING (true);

-- 認証されたユーザーが新しい来客者を追加可能
CREATE POLICY "Authenticated users can insert visitors"
  ON visitors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 認証されたユーザーが来客者情報を更新可能
CREATE POLICY "Authenticated users can update visitors"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 認証されたユーザーが来客者情報を削除可能（必要に応じて）
CREATE POLICY "Authenticated users can delete visitors"
  ON visitors
  FOR DELETE
  TO authenticated
  USING (true);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_visitors_check_in_time ON visitors(check_in_time);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at);

-- updated_at自動更新のためのトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーの作成
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();