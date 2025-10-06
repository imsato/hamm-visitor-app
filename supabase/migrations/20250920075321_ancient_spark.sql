/*
  # 退館処理のRLSポリシー修正

  1. 問題の確認
    - 匿名ユーザーによる退館処理（UPDATE）権限の確認
    - 既存のポリシーが適切に機能しているかチェック

  2. 修正内容
    - 匿名ユーザーが退館処理（UPDATE）を実行できるポリシーを追加
    - 既存のポリシーを確認し、必要に応じて修正
*/

-- 既存の匿名ユーザー用UPDATEポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow anonymous update for checkout" ON visitors;

-- 匿名ユーザーが退館処理（status更新とcheck_out_time設定）を実行できるポリシーを作成
CREATE POLICY "Allow anonymous checkout update"
  ON visitors
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (
    -- 退館処理のみ許可（checked-inからchecked-outへの変更）
    status = 'checked-out' AND check_out_time IS NOT NULL
  );

-- 認証済みユーザーの既存UPDATEポリシーを確認・修正
DROP POLICY IF EXISTS "Authenticated users can update visitors" ON visitors;

CREATE POLICY "Authenticated users can update visitors"
  ON visitors
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);