import React from "react";
import type { Localized } from "@/i18n/types";
import type { Locale } from "@/i18n/config";

export interface BlogPost {
  slug: string;
  /** ISO `YYYY-MM-DD`. Hiển thị được định dạng theo ngôn ngữ lúc render. */
  date: string;
  category: string;
  /**
   * Ngôn ngữ bài viết THẬT SỰ có. Ba bài đầu chỉ có tiếng Việt — chúng nhắm tới
   * lập trình viên tích hợp sàn TMĐT Việt Nam. Không dịch máy: một bài kỹ thuật
   * dịch ẩu hại uy tín hơn là không có bản dịch.
   */
  availableIn: Locale[];
  title: Localized<string>;
  readTime: Localized<string>;
  description: Localized<string>;
  content: Localized<() => React.JSX.Element>;
}

/** Bài chỉ có một ngôn ngữ: cùng một JSX cho cả hai locale. Trang bài viết đọc
 *  `availableIn` để hiện banner "bài này viết bằng tiếng Việt". */
function sameForBothLocales(
  render: () => React.JSX.Element,
): Localized<() => React.JSX.Element> {
  return { en: render, vi: render };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "double-counting-in-append-only-projections",
    date: "2026-08-21",
    category: "Django / Idempotency",
    availableIn: ["en", "vi"],
    title: {
      en: "Idempotent isn't optional: the double-counting bug hiding in every append-only sync",
      vi: "Idempotent không phải tùy chọn: lỗi đếm trùng ẩn trong mọi đồng bộ chỉ-thêm",
    },
    readTime: { en: "9 min read", vi: "9 phút đọc" },
    description: {
      en: "A polling sync detects changed records by updated_at and appends them to a history table. That works fine — until the upstream system is allowed to correct a record after the fact, and 'append' quietly becomes 'add it again'.",
      vi: "Một service polling phát hiện bản ghi thay đổi qua updated_at rồi ghi thêm vào bảng lịch sử. Chạy tốt — cho tới khi hệ thống nguồn được phép sửa lại một bản ghi đã xong, và 'ghi thêm' lặng lẽ biến thành 'cộng thêm lần nữa'.",
    },
    content: {
      en: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          A production-tracking sync had been running for months without a single error in
          the logs. Then, over a few weeks, the totals it reported started drifting — always
          upward, never down. No exception, no failed job, no alert. Just numbers that were
          quietly a bit too high, then a bit higher.
        </p>
        <p>
          Nothing was crashing because nothing was, technically, wrong. Every record the
          sync wrote was a correct, well-formed row. The bug was not in any single write —
          it was in what &ldquo;write once&rdquo; meant once the upstream system was allowed
          to change its mind. Here is the whole thing reduced to fifteen lines of plain
          Python — no framework, no database, just a dict standing in for the upstream
          system and a list standing in for the history table.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. The shape of the sync</h3>
        <p>
          A background job polls an upstream system every few seconds, notices which
          records changed, and appends each one to a history table used for reporting.
          &ldquo;Append&rdquo; is the natural choice — history should not get edited after
          the fact.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`# "source" stands in for the upstream system: one work order, done, qty 10.
source = {"WO-42": {"status": "DONE", "qty": 10}}

history = []  # append-only: we only ever add rows, never edit or remove one

def sync_once():
    for order_id, rec in source.items():
        if rec["status"] == "DONE":
            history.append({"order_id": order_id, "qty": rec["qty"]})

sync_once()
print(history)
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[{'order_id': 'WO-42', 'qty': 10}]
total: 10`}
        </pre>
        <p>Correct. This is also, for a long time, the whole story — right up until someone needs to fix a number after the fact.</p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. The correction that broke it</h3>
        <p>
          A few days later an operator notices the quantity was entered wrong and corrects
          it: 10 should have been 4. The upstream system updates the record in place — that
          part is fine, that is exactly what a correction should do. The sync polls again,
          notices the record changed, and does the only thing it knows how to do:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`source["WO-42"]["qty"] = 4   # the correction, applied upstream

sync_once()
print(history)
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[{'order_id': 'WO-42', 'qty': 10}, {'order_id': 'WO-42', 'qty': 4}]
total: 14`}
        </pre>
        <p>
          The corrected quantity is 4. The reported total is 14 — the wrong original number,
          plus the correct one, both counted. Nothing threw. Nothing logged a warning. The
          sync did precisely what &ldquo;detect a change, append a row&rdquo; says to do.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Why a &ldquo;duplicate check&rdquo; didn&apos;t save it</h3>
        <p>
          A safeguard like this usually already exists, and it usually looks like: remember
          the last thing you wrote for this order, and skip if the new one looks the same.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`last_seen = {}  # order_id -> the last snapshot we projected

def sync_once_with_dedup():
    for order_id, rec in source.items():
        if rec["status"] != "DONE":
            continue
        snapshot = {"qty": rec["qty"]}
        if last_seen.get(order_id) == snapshot:
            continue  # identical to last time -> skip
        history.append({"order_id": order_id, "qty": rec["qty"]})
        last_seen[order_id] = snapshot`}
        </pre>
        <p>
          This looks like exactly the fix the previous section needed. Run it through the
          same correction, though, and it changes nothing:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`sync_once_with_dedup()             # first call: appends normally, records the snapshot
source["WO-42"]["qty"] = 7         # a second correction
sync_once_with_dedup()
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`total: 21   # 10 + 4 + 7, every version ever seen, still summed together`}
        </pre>
        <p>
          The check compares <em>content</em>: is this snapshot equal to the last one? A
          correction is, by definition, different content about the same fact — so the check
          correctly concludes &ldquo;this is new data&rdquo; and lets it straight through.
          It is answering a real question, just not the one that matters. The question that
          matters is not &ldquo;have I seen this exact value before?&rdquo; but{" "}
          <strong>&ldquo;have I already produced a row for this fact?&rdquo;</strong>
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. The fix: key by identity, not by content</h3>
        <p>
          The fix is a one-line change in shape, not a smarter comparison. Instead of a list
          you append to, keep a dict keyed by the identity of the fact — the order — and
          write into its slot every time:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`history_by_order = {}  # order_id -> the ONE row that represents it, always current

def sync_once_fixed():
    for order_id, rec in source.items():
        if rec["status"] == "DONE":
            history_by_order[order_id] = {"order_id": order_id, "qty": rec["qty"]}

sync_once_fixed()
source["WO-42"]["qty"] = 7   # as many corrections as you like, in any order
sync_once_fixed()
source["WO-42"]["qty"] = 4
sync_once_fixed()
print("total:", sum(r["qty"] for r in history_by_order.values()))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`total: 4   # correct, no matter how many times the order was corrected`}
        </pre>
        <p>
          Re-detecting the same order now updates its one row instead of adding a second.
          The projection converges to whatever the source currently says, instead of
          accumulating everything the source has ever said. The change in a real system is
          small — a foreign key from the history row back to the source row it came from,
          and an update-in-place instead of an insert — but the underlying idea is exactly
          this dict.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Verify against the source, not against your own table</h3>
        <p>
          A fix like this is easy to believe and expensive to be wrong about. The only check
          that is not just trusting the code that just changed is a reconciliation against
          the upstream system itself:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`def reconcile():
    source_total = sum(r["qty"] for r in source.values() if r["status"] == "DONE")
    projected_total = sum(r["qty"] for r in history_by_order.values())
    diff = projected_total - source_total
    print("OK" if diff == 0 else f"MISMATCH: projected={projected_total}, source={source_total}, diff={diff}")

reconcile()`}
        </pre>
        <p>
          Run once, this finds every record already double-counted before the fix shipped,
          so the backlog can be cleaned up in one pass. Left running permanently — not as a
          one-off migration script — it is the one thing in this whole story that would have
          caught the drift after the very first correction instead of three weeks later.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">6. The fix that almost introduced its own bug</h3>
        <p>
          The same correction needs to flow into a second field: when the order finished.
          The existing code only ever set that once, while it was still empty — exactly the
          pattern that caused the double-counting bug, so the instinct is to make it
          idempotent the same way: always overwrite with the latest value.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`schedule = {"WO-42": {"finished_at": None}}

# First pass — looks idempotent, is not safe:
def sync_schedule(order_id):
    rec = source[order_id]
    if rec["status"] == "DONE":
        schedule[order_id]["finished_at"] = rec.get("finished_at")  # always overwrite`}
        </pre>
        <p>
          It works, right up until a poll reads the record at a moment where{" "}
          <code>finished_at</code> has not landed yet even though the status already says
          done — a plain race between two fields on the same record:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`source["WO-42"]["finished_at"] = 100
sync_schedule("WO-42")
print(schedule)                          # {'finished_at': 100} - correct

source["WO-42"]["finished_at"] = None     # a later read arrives before the field lands
sync_schedule("WO-42")
print(schedule)                          # {'finished_at': None} - a correct value, wiped`}
        </pre>
        <p>
          &ldquo;Always overwrite with the latest value&rdquo; just did something worse than
          the original bug: it took a value that was already correct and quietly erased it,
          because it never asked whether the new value was actually complete. A doubled
          number is wrong in an obvious direction. A silently deleted timestamp is wrong in a
          way nothing downstream complains about until much later.
        </p>
        <p>Caught in review, the fix is one extra condition — never let an incomplete read regress a good value:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`def sync_schedule_fixed(order_id):
    rec = source[order_id]
    new_value = rec.get("finished_at")
    if rec["status"] == "DONE" and new_value is not None:   # <- the guard
        schedule[order_id]["finished_at"] = new_value`}
        </pre>
        <p>
          The lesson is not &ldquo;add a null check&rdquo;. It is that{" "}
          <strong>&ldquo;idempotent&rdquo; and &ldquo;always take the latest value&rdquo; are
          not the same property.</strong> The first means re-running the same input produces
          the same result. The second silently assumes every read of the latest value is
          complete — and the moment that assumption is false, overwrite-idempotency starts
          destroying data that append-only duplication only inflated.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">7. What generalizes past this one sync</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Change detection by timestamp plus append-only writes is a bug waiting on
            a correction.</strong> If the upstream can ever re-emit the same status with
            different data, you already have this — you just have not had a correction yet.
          </li>
          <li>
            <strong>Key idempotency on the identity of the fact,</strong> not on its content
            or on a polling time window. Content tells you whether the data looks new;
            identity is what lets you find &ldquo;the row this fact already produced&rdquo;
            and update it instead of adding to it.
          </li>
          <li>
            <strong>Idempotent does not mean always-overwrite.</strong> Every unconditional
            overwrite needs a guard against the incoming value being null, stale, or
            otherwise incomplete — or you convert a duplication bug into a data-loss bug the
            first time a read races ahead of a write.
          </li>
          <li>
            <strong>Keep the reconciliation check as a standing job, not a migration
            script.</strong> It is the only thing in this story that would have caught the
            drift on day one instead of week three.
          </li>
        </ul>
        <p>
          I found this while building a production-tracking sync between two backend
          systems for a client — real Django models and a Postgres table, not a dict and a
          list. But the bug and the fix are exactly these fifteen lines. The first patch I
          wrote solved the double-counting and, on its own, introduced the null-regression
          above — caught in review, not in production, which is the outcome you actually
          want from writing the reconciliation check before you ship, not after someone asks
          why the totals look odd.
        </p>
      </div>
      ),
      vi: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Một service đồng bộ dữ liệu sản xuất chạy nhiều tháng không lỗi trong log. Rồi
          trong vài tuần, các con số tổng nó báo cáo bắt đầu trôi — luôn tăng, không bao giờ
          giảm. Không exception, không job fail, không alert nào. Chỉ là các con số lặng lẽ
          cao hơn một chút, rồi cao hơn nữa.
        </p>
        <p>
          Không có gì crash vì về mặt kỹ thuật không có gì sai. Mỗi bản ghi service ghi ra
          đều đúng, đủ trường. Lỗi không nằm ở một lần ghi nào cả — nó nằm ở việc &ldquo;ghi
          một lần&rdquo; nghĩa là gì, khi hệ thống nguồn được phép đổi ý. Dưới đây là toàn bộ
          câu chuyện rút gọn còn mười lăm dòng Python thuần — không framework, không
          database, chỉ một dict đóng vai hệ thống nguồn và một list đóng vai bảng lịch sử.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Hình dạng của việc đồng bộ</h3>
        <p>
          Một job nền polling hệ thống nguồn mỗi vài giây, phát hiện bản ghi nào thay đổi,
          rồi ghi thêm từng bản ghi vào một bảng lịch sử dùng cho báo cáo. &ldquo;Ghi
          thêm&rdquo; là lựa chọn tự nhiên — lịch sử thì không nên bị sửa lại sau đó.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`# "source" đóng vai hệ thống nguồn: một đơn hàng, đã xong, số lượng 10.
source = {"WO-42": {"status": "DONE", "qty": 10}}

history = []  # chỉ-thêm: chỉ được thêm dòng, không bao giờ sửa hay xoá

def sync_once():
    for order_id, rec in source.items():
        if rec["status"] == "DONE":
            history.append({"order_id": order_id, "qty": rec["qty"]})

sync_once()
print(history)
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[{'order_id': 'WO-42', 'qty': 10}]
total: 10`}
        </pre>
        <p>Đúng. Và đây cũng là toàn bộ câu chuyện trong thời gian dài — cho tới khi có người cần sửa lại một con số sau đó.</p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Bản sửa đã làm hỏng nó</h3>
        <p>
          Vài ngày sau, người vận hành nhận ra số lượng nhập sai và sửa lại: 10 đáng lẽ phải
          là 4. Hệ thống nguồn cập nhật bản ghi tại chỗ — phần đó ổn, đúng là việc một bản sửa
          nên làm. Service đồng bộ poll lại, thấy bản ghi đổi, và làm điều duy nhất nó biết
          làm:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`source["WO-42"]["qty"] = 4   # bản sửa, áp dụng ở phía nguồn

sync_once()
print(history)
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`[{'order_id': 'WO-42', 'qty': 10}, {'order_id': 'WO-42', 'qty': 4}]
total: 14`}
        </pre>
        <p>
          Số lượng đã sửa là 4. Tổng báo cáo là 14 — cả con số sai ban đầu lẫn con số đúng
          đều được cộng vào. Không gì ném lỗi. Không gì log cảnh báo. Service đồng bộ làm
          đúng chính xác những gì &ldquo;phát hiện thay đổi, ghi thêm một dòng&rdquo; yêu cầu.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Vì sao một &ldquo;bước kiểm tra trùng lặp&rdquo; không cứu được nó</h3>
        <p>
          Một cơ chế bảo vệ kiểu này thường đã tồn tại sẵn, và thường trông như: nhớ lần ghi
          gần nhất cho đơn hàng này, và bỏ qua nếu lần mới trông giống hệt.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`last_seen = {}  # order_id -> snapshot lần chiếu gần nhất

def sync_once_with_dedup():
    for order_id, rec in source.items():
        if rec["status"] != "DONE":
            continue
        snapshot = {"qty": rec["qty"]}
        if last_seen.get(order_id) == snapshot:
            continue  # y hệt lần trước -> bỏ qua
        history.append({"order_id": order_id, "qty": rec["qty"]})
        last_seen[order_id] = snapshot`}
        </pre>
        <p>
          Nhìn trông như đúng thứ phần trước cần. Nhưng chạy qua đúng bản sửa vừa rồi thì nó
          không đổi được gì:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`sync_once_with_dedup()             # lần đầu: ghi thêm bình thường, lưu lại snapshot
source["WO-42"]["qty"] = 7         # một bản sửa thứ hai
sync_once_with_dedup()
print("total:", sum(h["qty"] for h in history))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`total: 21   # 10 + 4 + 7, mọi phiên bản từng thấy, vẫn cộng dồn hết`}
        </pre>
        <p>
          Bước kiểm tra này so sánh <em>nội dung</em>: snapshot này có bằng lần trước không?
          Một bản sửa, theo định nghĩa, là nội dung khác về cùng một sự việc — nên bước kiểm
          tra kết luận đúng &ldquo;đây là dữ liệu mới&rdquo; và cho qua thẳng. Nó đang trả lời
          một câu hỏi có thật, chỉ không phải câu hỏi quan trọng. Câu hỏi quan trọng không
          phải &ldquo;tôi đã thấy đúng giá trị này chưa?&rdquo; mà là{" "}
          <strong>&ldquo;tôi đã tạo ra một dòng cho sự việc này chưa?&rdquo;</strong>
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Cách sửa: khoá theo danh tính, không theo nội dung</h3>
        <p>
          Cách sửa là đổi hình dạng bằng một dòng, không phải một phép so sánh thông minh
          hơn. Thay vì một list để ghi thêm, giữ một dict khoá theo danh tính của sự việc —
          đơn hàng — và ghi vào đúng ô của nó mỗi lần:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`history_by_order = {}  # order_id -> MỘT dòng duy nhất đại diện cho nó, luôn cập nhật

def sync_once_fixed():
    for order_id, rec in source.items():
        if rec["status"] == "DONE":
            history_by_order[order_id] = {"order_id": order_id, "qty": rec["qty"]}

sync_once_fixed()
source["WO-42"]["qty"] = 7   # sửa bao nhiêu lần cũng được, thứ tự nào cũng được
sync_once_fixed()
source["WO-42"]["qty"] = 4
sync_once_fixed()
print("total:", sum(r["qty"] for r in history_by_order.values()))`}
        </pre>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`total: 4   # đúng, dù đơn hàng đã bị sửa bao nhiêu lần đi nữa`}
        </pre>
        <p>
          Phát hiện lại cùng một đơn hàng giờ cập nhật đúng một dòng của nó thay vì thêm dòng
          thứ hai. Phần chiếu hội tụ về đúng điều nguồn đang nói ở hiện tại, thay vì cộng dồn
          mọi thứ nguồn từng nói. Trong hệ thống thật, thay đổi rất nhỏ — một khoá ngoại từ
          dòng lịch sử trỏ về đúng bản ghi nguồn sinh ra nó, và UPDATE tại chỗ thay vì INSERT
          — nhưng ý tưởng nền tảng chính là cái dict này.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Đối soát với nguồn, không phải với chính bảng của mình</h3>
        <p>
          Một bản sửa như thế này dễ tin và đắt nếu sai. Phép kiểm tra duy nhất không chỉ
          tin vào chính đoạn code vừa đổi là đối soát với chính hệ thống nguồn:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`def reconcile():
    source_total = sum(r["qty"] for r in source.values() if r["status"] == "DONE")
    projected_total = sum(r["qty"] for r in history_by_order.values())
    diff = projected_total - source_total
    print("OK" if diff == 0 else f"LỆCH: projected={projected_total}, source={source_total}, diff={diff}")

reconcile()`}
        </pre>
        <p>
          Chạy một lần, nó tìm ra mọi bản ghi đã bị đếm trùng từ trước khi bản sửa được đưa
          lên, để dọn dẹp một lượt. Để nó chạy thường trực — không phải một script migration
          chạy một lần — nó là thứ duy nhất trong cả câu chuyện này lẽ ra đã bắt được độ trôi
          ngay từ lần sửa đầu tiên, thay vì ba tuần sau.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">6. Bản sửa suýt tạo ra lỗi của chính nó</h3>
        <p>
          Cùng bản sửa đó cần chảy vào một trường thứ hai: thời điểm đơn hàng hoàn thành.
          Code cũ chỉ từng đặt giá trị đó một lần, lúc nó còn rỗng — đúng mẫu hình đã gây ra
          lỗi đếm trùng, nên bản năng là làm nó idempotent theo cùng cách: luôn ghi đè bằng
          giá trị mới nhất.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`schedule = {"WO-42": {"finished_at": None}}

# Bản đầu tiên — trông idempotent, nhưng không an toàn:
def sync_schedule(order_id):
    rec = source[order_id]
    if rec["status"] == "DONE":
        schedule[order_id]["finished_at"] = rec.get("finished_at")  # luôn ghi đè`}
        </pre>
        <p>
          Nó chạy đúng, cho tới khi một lần poll đọc bản ghi đúng lúc{" "}
          <code>finished_at</code> chưa kịp cập nhật xong dù trạng thái đã báo hoàn thành —
          một cuộc đua bình thường giữa hai trường trên cùng một bản ghi:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`source["WO-42"]["finished_at"] = 100
sync_schedule("WO-42")
print(schedule)                          # {'finished_at': 100} - đúng

source["WO-42"]["finished_at"] = None     # lượt đọc sau tới trước khi trường này kịp ghi
sync_schedule("WO-42")
print(schedule)                          # {'finished_at': None} - giá trị đúng, bị xoá`}
        </pre>
        <p>
          &ldquo;Luôn ghi đè bằng giá trị mới nhất&rdquo; vừa làm điều tệ hơn lỗi gốc: nó lấy
          một giá trị đã đúng và lặng lẽ xoá nó, vì nó chưa bao giờ tự hỏi giá trị mới có thật
          sự đầy đủ hay không. Một con số bị đếm đôi sai theo hướng dễ thấy. Một timestamp bị
          xoá âm thầm sai theo cách không có gì phía sau kêu ca cho tới rất lâu sau.
        </p>
        <p>Bị bắt lại lúc review, cách sửa chỉ thêm một điều kiện — không bao giờ để một lượt đọc dở dang lùi một giá trị tốt:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`def sync_schedule_fixed(order_id):
    rec = source[order_id]
    new_value = rec.get("finished_at")
    if rec["status"] == "DONE" and new_value is not None:   # <- chốt chặn
        schedule[order_id]["finished_at"] = new_value`}
        </pre>
        <p>
          Bài học không phải là &ldquo;thêm một chỗ check null&rdquo;. Mà là{" "}
          <strong>&ldquo;idempotent&rdquo; và &ldquo;luôn lấy giá trị mới nhất&rdquo; không
          phải cùng một tính chất.</strong> Cái đầu nghĩa là chạy lại cùng input cho cùng kết
          quả. Cái sau lặng lẽ giả định mọi lần đọc giá trị mới nhất đều đầy đủ — và ngay khi
          giả định đó sai, idempotent-bằng-ghi-đè bắt đầu phá huỷ dữ liệu mà lỗi đếm trùng
          chỉ-thêm chỉ làm phồng lên.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">7. Điều khái quát được ra ngoài service này</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Phát hiện thay đổi bằng timestamp cộng với ghi chỉ-thêm là một lỗi đang
            chờ một lần sửa.</strong> Nếu nguồn từng có thể phát lại cùng trạng thái với số
            liệu khác, bạn đã có lỗi này — chỉ là chưa gặp lần sửa nào thôi.
          </li>
          <li>
            <strong>Khoá idempotency theo danh tính của sự việc,</strong> không theo nội dung
            hay khung thời gian polling. Nội dung cho biết dữ liệu trông có mới hay không;
            danh tính mới là thứ giúp bạn tìm ra &ldquo;dòng mà sự việc này đã từng sinh
            ra&rdquo; để cập nhật, thay vì cộng thêm.
          </li>
          <li>
            <strong>Idempotent không có nghĩa là luôn ghi đè.</strong> Mọi lần ghi đè vô điều
            kiện cần một chốt chặn giá trị đến là null, cũ, hoặc chưa đầy đủ — nếu không, bạn
            biến một lỗi đếm trùng thành một lỗi mất dữ liệu ngay lần đầu một lượt đọc chạy
            trước một lượt ghi.
          </li>
          <li>
            <strong>Giữ phép đối soát như một job thường trực, không phải một script
            migration.</strong> Đó là thứ duy nhất trong câu chuyện này lẽ ra đã bắt được độ
            trôi ngay ngày đầu, thay vì tới tuần thứ ba.
          </li>
        </ul>
        <p>
          Tôi gặp chuyện này khi xây một service đồng bộ dữ liệu sản xuất giữa hai hệ thống
          backend cho một khách hàng — model Django và bảng Postgres thật, không phải một
          dict với một list. Nhưng lỗi và cách sửa chính là mười lăm dòng này. Bản sửa đầu
          tiên tôi viết giải quyết được lỗi đếm trùng và, tự nó, tạo ra lỗi lùi-về-null nói
          trên — bị bắt lại lúc review, không phải trên production, đúng là kết quả bạn muốn
          có được từ việc viết phép đối soát trước khi ship, chứ không phải sau khi có người
          hỏi vì sao các con số trông là lạ.
        </p>
      </div>
      ),
    },
  },
  {
    slug: "silent-missing-await-run-in-executor",
    date: "2026-08-21",
    category: "Python / asyncio",
    availableIn: ["en", "vi"],
    title: {
      en: "Silent by design: why a missing await on run_in_executor survives review",
      vi: "Không một dòng cảnh báo: vì sao lỗi thiếu await ở run_in_executor lọt qua mọi vòng review",
    },
    readTime: { en: "9 min read", vi: "9 phút đọc" },
    description: {
      en: "Forgetting await on a coroutine is loud. Forgetting it on run_in_executor is completely silent — and shared global state makes the bug heal itself after the first call, which is exactly why nobody catches it.",
      vi: "Quên await một coroutine thì Python kêu. Quên await run_in_executor thì im hoàn toàn — và state global khiến lỗi tự khỏi sau lần gọi đầu, đúng lý do không ai bắt được nó.",
    },
    content: {
      en: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          A background service ran fine for weeks. Every so often one processing cycle
          would act on data that was <strong>incomplete</strong> — a few records simply
          missing. No exception. No warning. Nothing in the logs. Restarting made it go
          away, so for a long time it was filed under &ldquo;probably the network&rdquo;.
        </p>
        <p>
          The cause was two lines that look completely ordinary, and a language behaviour
          that most Python developers assume works the other way around.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Fifteen lines that reproduce it</h3>
        <p>
          This is not the production code — it is the smallest thing I could write that
          fails the same way. Run it yourself; that is the point.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import asyncio, time
from concurrent.futures import ThreadPoolExecutor

state: dict[str, str] = {}

def load(key: str) -> None:          # stands in for a DB query
    time.sleep(0.05)
    state[key] = "loaded"

async def build_state(loop, ex) -> dict[str, str]:
    loop.run_in_executor(ex, load, "agents")      # <- no await
    loop.run_in_executor(ex, load, "equipment")   # <- no await
    return dict(state)                            # returns while threads still run

async def main():
    ex = ThreadPoolExecutor(4)
    for i in range(5):
        print(f"run {i+1}: {await build_state(asyncio.get_running_loop(), ex)}")
        await asyncio.sleep(0.06)

asyncio.run(main())`}
        </pre>
        <p>Output:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`run 1: {}
run 2: {'agents': 'loaded', 'equipment': 'loaded'}
run 3: {'agents': 'loaded', 'equipment': 'loaded'}
run 4: {'agents': 'loaded', 'equipment': 'loaded'}
run 5: {'agents': 'loaded', 'equipment': 'loaded'}`}
        </pre>
        <p>
          The first call returns empty. Every call after it looks correct. There is no
          error anywhere.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Why Python stays quiet</h3>
        <p>
          Most of us learned that forgetting <code>await</code> is loud — Python emits{" "}
          <code>RuntimeWarning: coroutine was never awaited</code>. That is true, and it is
          also the reason this bug is so easy to miss: the warning belongs to{" "}
          <strong>coroutines</strong>, and <code>run_in_executor</code> does not return one.
          It returns a <strong>Future</strong>, and Futures have no equivalent warning.
        </p>
        <div className="border border-zinc-300 rounded-lg overflow-hidden my-2">
          <table className="w-full my-6 border border-zinc-200 rounded-lg overflow-hidden text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="p-3 w-[38%] font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                        What you forgot to await
                      </th>
                      <th className="p-3 font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                        What Python tells you
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px]">
                    <tr className="border-b border-zinc-200">
                      <td className="p-3 align-top"><code>a coroutine</code></td>
                      <td className="p-3 align-top text-amber-700">RuntimeWarning: coroutine ... was never awaited</td>
                    </tr>
                    <tr>
                      <td className="p-3 align-top"><code>run_in_executor(...)</code></td>
                      <td className="p-3 align-top text-zinc-400 italic">nothing at all</td>
                    </tr>
                  </tbody>
                </table>
        </div>
        <p>
          I checked this on Python 3.9 and on 3.14: identical behaviour. This is not a
          rough edge of an old release that has since been fixed.
        </p>
        <p>
          One caveat worth stating precisely, because it is easy to overclaim here: if the
          function you hand to the executor <em>raises</em>, Python does eventually print{" "}
          <code>Future exception was never retrieved</code>. But it prints it when the Future
          is collected — not at the call site, not in the stack that caused it, and easily
          buried in a long-running server. And in the case that actually hurts, the function
          does not raise at all. It succeeds. It is just late.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Why nobody catches it in review</h3>
        <p>
          This is the part I find genuinely interesting. Look again at the output: the first
          call is wrong, and then the bug appears to <strong>heal itself</strong>.
        </p>
        <p>
          It heals because <code>state</code> is a module-level global that survives between
          calls. By the second call the threads from the first call have finished and
          populated it. Call two is not reading its own data — it is reading{" "}
          <strong>leftovers from call one</strong>.
        </p>
        <p>
          Run the same code with a fresh state object each time and the disguise falls away:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`state GLOBAL (kept between calls):  [0, 2, 2, 2]   <- only the first call is wrong
state LOCAL  (reset every call):    [0, 0, 0, 0]   <- wrong every time`}
        </pre>
        <p>
          That is the whole reason this class of bug survives: you hit it once, reload, and
          it works. It does not reproduce on demand, so it never becomes a ticket. It waits
          for a cold start in production.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. The obvious fix, and why it is not enough</h3>
        <p>Collect the futures and await them:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`futures = [
    loop.run_in_executor(ex, load, "agents"),
    loop.run_in_executor(ex, load, "equipment"),
]
await asyncio.gather(*futures)
return dict(state)`}
        </pre>
        <p>
          This fixes the timing. It does not fix the second problem, and the second problem
          is worse.
        </p>
        <p>
          If one loader raises, <code>gather()</code> re-raises — good. But the other loaders
          have <strong>already mutated the shared state</strong>. You are now left with a
          global that is half-updated, and it stays that way. The next request does not
          fail; it quietly reads a state that is part-new and part-old. A crash that leaves
          bad data behind is worse than a crash.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Build beside, then swap</h3>
        <p>
          The fix is not to add a backup-and-restore path around the mutation. It is to stop
          mutating the live object at all:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`async def build_state(loop, ex) -> dict[str, str]:
    global state
    new_state: dict[str, str] = {}                  # build beside the live one

    def load_into(target, key):
        time.sleep(0.05)
        target[key] = "loaded"

    await asyncio.gather(
        loop.run_in_executor(ex, load_into, new_state, "agents"),
        loop.run_in_executor(ex, load_into, new_state, "equipment"),
    )

    state = new_state                               # swap only after all succeed
    return dict(state)`}
        </pre>
        <p>
          If anything fails, <code>gather()</code> raises before the assignment, and the
          previous state is still intact and still consistent. Readers never observe a
          half-built object, because the only thing that ever changes for them is one
          reference.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">6. The general shape</h3>
        <p>
          None of this is new — it is copy-on-write, and it turns up everywhere once you
          recognise it. A git commit does not edit your previous commit. A blue-green deploy
          does not upgrade the running fleet in place. <code>os.rename()</code> is atomic
          precisely so that a writer can build a file beside the real one and then move it
          over.
        </p>
        <p>The two ingredients that made the original bug are worth naming, because they travel together:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Fire-and-forget concurrency</strong> — work started but never joined.</li>
          <li><strong>Shared mutable state</strong> — so partial results outlive the request that produced them.</li>
        </ul>
        <p>
          Either alone is survivable. Together they produce corruption with no error attached
          to it, and a symptom that disappears when you look at it.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">7. How to check your own code</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Grep for <code>run_in_executor</code> and check every call site: is the returned
            Future stored, gathered, or awaited? A bare call on its own line is the smell.
          </li>
          <li>
            The same applies to <code>asyncio.create_task()</code> and{" "}
            <code>ensure_future()</code> — same pattern, same silence.
          </li>
          <li>
            <strong>Reset the shared state at the start of each call and run your tests.</strong>{" "}
            If results suddenly break every time instead of only on the first run, you have
            just made a hidden bug reproducible — that is the useful outcome, not a
            regression.
          </li>
        </ul>
        <p>
          I found this while auditing an async data-loading path in a scheduling service.
          The report I wrote at the time said &ldquo;add the missing await&rdquo;. It took a
          second pass to notice that the missing await was the smaller half of the problem.
        </p>
      </div>
      ),
      vi: () => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Một service nền chạy ổn suốt nhiều tuần. Thỉnh thoảng có một vòng xử lý làm việc
          trên dữ liệu <strong>thiếu</strong> — vài bản ghi đơn giản là không có. Không
          exception. Không cảnh báo. Log sạch trơn. Restart thì hết, nên suốt một thời gian
          dài nó bị xếp vào loại &ldquo;chắc do mạng&rdquo;.
        </p>
        <p>
          Nguyên nhân là hai dòng trông hoàn toàn bình thường, cộng với một hành vi của
          Python mà phần lớn lập trình viên tin là ngược lại.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Mười lăm dòng tái hiện</h3>
        <p>
          Đây không phải code production — đây là thứ nhỏ nhất tôi viết được để nó hỏng theo
          đúng cách đó. Bạn chạy thử đi; đó mới là điểm chính.
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import asyncio, time
from concurrent.futures import ThreadPoolExecutor

state: dict[str, str] = {}

def load(key: str) -> None:          # thay cho một truy vấn DB
    time.sleep(0.05)
    state[key] = "loaded"

async def build_state(loop, ex) -> dict[str, str]:
    loop.run_in_executor(ex, load, "agents")      # <- thiếu await
    loop.run_in_executor(ex, load, "equipment")   # <- thiếu await
    return dict(state)                            # trả về khi thread còn chạy

async def main():
    ex = ThreadPoolExecutor(4)
    for i in range(5):
        print(f"lần {i+1}: {await build_state(asyncio.get_running_loop(), ex)}")
        await asyncio.sleep(0.06)

asyncio.run(main())`}
        </pre>
        <p>Kết quả:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`lần 1: {}
lần 2: {'agents': 'loaded', 'equipment': 'loaded'}
lần 3: {'agents': 'loaded', 'equipment': 'loaded'}
lần 4: {'agents': 'loaded', 'equipment': 'loaded'}
lần 5: {'agents': 'loaded', 'equipment': 'loaded'}`}
        </pre>
        <p>
          Lần gọi đầu trả về rỗng. Mọi lần sau trông đúng. Không có lỗi ở đâu cả.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Vì sao Python im lặng</h3>
        <p>
          Phần lớn chúng ta học rằng quên <code>await</code> là Python sẽ kêu:{" "}
          <code>RuntimeWarning: coroutine was never awaited</code>. Điều đó đúng — và cũng
          chính là lý do lỗi này dễ lọt: cảnh báo đó thuộc về <strong>coroutine</strong>, mà{" "}
          <code>run_in_executor</code> không trả về coroutine. Nó trả về{" "}
          <strong>Future</strong>, và Future không có cảnh báo tương đương.
        </p>
        <div className="border border-zinc-300 rounded-lg overflow-hidden my-2">
          <table className="w-full my-6 border border-zinc-200 rounded-lg overflow-hidden text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200">
                      <th className="p-3 w-[38%] font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                        Bạn quên await cái gì
                      </th>
                      <th className="p-3 font-sans font-bold text-[10px] uppercase tracking-wider text-zinc-500">
                        Python báo gì
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[12px]">
                    <tr className="border-b border-zinc-200">
                      <td className="p-3 align-top"><code>một coroutine</code></td>
                      <td className="p-3 align-top text-amber-700">RuntimeWarning: coroutine ... was never awaited</td>
                    </tr>
                    <tr>
                      <td className="p-3 align-top"><code>run_in_executor(...)</code></td>
                      <td className="p-3 align-top text-zinc-400 italic">không gì cả</td>
                    </tr>
                  </tbody>
                </table>
        </div>
        <p>
          Tôi kiểm trên Python 3.9 và 3.14: hành vi giống hệt nhau. Đây không phải khuyết
          điểm của một bản cũ đã được vá.
        </p>
        <p>
          Có một điểm cần nói cho chính xác, vì rất dễ nói quá ở chỗ này: nếu hàm bạn đưa cho
          executor <em>ném exception</em>, Python cuối cùng vẫn in{" "}
          <code>Future exception was never retrieved</code>. Nhưng nó in lúc Future bị thu
          hồi — không phải tại chỗ gọi, không nằm trong stack gây ra lỗi, và rất dễ chìm
          nghỉm trong một server chạy dài. Còn trong trường hợp thật sự gây đau, hàm đó{" "}
          <strong>không ném gì cả</strong>. Nó chạy thành công. Chỉ là muộn.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Vì sao không ai bắt được khi review</h3>
        <p>
          Đây mới là phần tôi thấy đáng nói. Nhìn lại kết quả: lần gọi đầu sai, rồi lỗi có vẻ{" "}
          <strong>tự khỏi</strong>.
        </p>
        <p>
          Nó tự khỏi vì <code>state</code> là biến global cấp module, sống sót giữa các lần
          gọi. Tới lần thứ hai thì các thread của lần đầu đã chạy xong và điền đầy nó. Lần
          hai không đọc dữ liệu của chính nó — nó đọc{" "}
          <strong>đồ thừa lại của lần một</strong>.
        </p>
        <p>
          Chạy đúng code đó nhưng reset state mỗi lần, lớp nguỵ trang rơi ra:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`state GLOBAL (giữ giữa các lần):  [0, 2, 2, 2]   <- chỉ lần đầu sai
state CỤC BỘ (reset mỗi lần):     [0, 0, 0, 0]   <- sai mọi lần`}
        </pre>
        <p>
          Đó là toàn bộ lý do lớp lỗi này sống sót: bạn gặp một lần, tải lại, thấy chạy được.
          Nó không tái hiện theo yêu cầu, nên không bao giờ thành ticket. Nó nằm chờ một lần
          khởi động nguội trên production.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Cách sửa hiển nhiên, và vì sao chưa đủ</h3>
        <p>Gom future lại rồi await:</p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`futures = [
    loop.run_in_executor(ex, load, "agents"),
    loop.run_in_executor(ex, load, "equipment"),
]
await asyncio.gather(*futures)
return dict(state)`}
        </pre>
        <p>
          Cách này sửa được vấn đề thời điểm. Nó không sửa được vấn đề thứ hai, và vấn đề thứ
          hai tệ hơn.
        </p>
        <p>
          Nếu một loader ném exception, <code>gather()</code> ném lại — tốt. Nhưng các loader
          khác <strong>đã kịp mutate state dùng chung</strong>. Bạn còn lại một biến global
          cập nhật dở dang, và nó ở nguyên trạng thái đó. Request kế tiếp không lỗi; nó lặng
          lẽ đọc một state nửa mới nửa cũ. Một cú crash để lại dữ liệu hỏng còn tệ hơn cú
          crash.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Dựng bên cạnh, rồi đổi con trỏ</h3>
        <p>
          Cách sửa không phải là thêm đường backup-rồi-restore quanh chỗ mutate. Cách sửa là
          đừng mutate đối tượng đang sống nữa:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`async def build_state(loop, ex) -> dict[str, str]:
    global state
    new_state: dict[str, str] = {}                  # dựng bên cạnh bản đang sống

    def load_into(target, key):
        time.sleep(0.05)
        target[key] = "loaded"

    await asyncio.gather(
        loop.run_in_executor(ex, load_into, new_state, "agents"),
        loop.run_in_executor(ex, load_into, new_state, "equipment"),
    )

    state = new_state                               # chỉ đổi khi TẤT CẢ đã xong
    return dict(state)`}
        </pre>
        <p>
          Nếu có gì hỏng, <code>gather()</code> ném trước dòng gán, và state cũ vẫn nguyên
          vẹn, vẫn nhất quán. Người đọc không bao giờ thấy một đối tượng dựng dở, vì thứ duy
          nhất thay đổi với họ là một tham chiếu.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">6. Hình dạng chung</h3>
        <p>
          Chẳng có gì mới ở đây — đó là copy-on-write, và nhận ra rồi thì thấy nó ở khắp nơi.
          Một commit git không sửa commit trước đó. Blue-green deploy không nâng cấp tại chỗ
          đám máy đang chạy. <code>os.rename()</code> nguyên tử chính là để người ghi dựng
          file bên cạnh file thật rồi mới dời qua.
        </p>
        <p>Hai thành phần tạo nên lỗi gốc đáng được gọi tên, vì chúng hay đi cùng nhau:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Concurrency kiểu bắn-rồi-quên</strong> — khởi động việc nhưng không bao giờ chờ.</li>
          <li><strong>State dùng chung, sửa được</strong> — nên kết quả dở dang sống lâu hơn cái request sinh ra nó.</li>
        </ul>
        <p>
          Mỗi thứ riêng lẻ đều còn chịu được. Đi cùng nhau, chúng tạo ra dữ liệu hỏng mà
          không kèm lỗi nào, và một triệu chứng biến mất ngay khi bạn nhìn vào.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">7. Cách tự soi code của bạn</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Grep <code>run_in_executor</code> rồi soi từng chỗ gọi: Future trả về có được giữ,
            gom, hay await không? Một lời gọi trần đứng riêng một dòng là dấu hiệu.
          </li>
          <li>
            Điều tương tự áp cho <code>asyncio.create_task()</code> và{" "}
            <code>ensure_future()</code> — cùng mẫu, cùng sự im lặng.
          </li>
          <li>
            <strong>Reset state dùng chung ở đầu mỗi lần gọi rồi chạy test.</strong> Nếu kết
            quả bỗng sai mọi lần thay vì chỉ lần đầu, bạn vừa biến một lỗi ẩn thành lỗi tái
            hiện được — đó là kết quả tốt, không phải hồi quy.
          </li>
        </ul>
        <p>
          Tôi gặp chuyện này khi rà một đường nạp dữ liệu bất đồng bộ trong một service lập
          lịch. Báo cáo tôi viết lúc đó ghi &ldquo;thêm await còn thiếu&rdquo;. Phải tới lượt
          đọc thứ hai mới nhận ra: cái await còn thiếu mới là nửa nhỏ của vấn đề.
        </p>
      </div>
      ),
    },
  },
  {
    slug: "shopee-api-integration",
    date: "2026-05-23",
    category: "API Integration",
    availableIn: ["vi"],
    title: { en: "Integrating Shopee Open API v2 with Node.js / TypeScript", vi: "Hướng dẫn chi tiết tích hợp Shopee API v2 bằng Node.js / TypeScript" },
    readTime: { en: "8 min read", vi: "8 phút đọc" },
    description: { en: "Setting up the connection, handling the seller auth flow, refreshing tokens automatically, and calling the order APIs with shopee-api-client.", vi: "Khám phá cách thiết lập kết nối, xử lý Seller Auth Flow, tự động quản lý Token và gọi API đơn hàng bằng thư viện shopee-api-client." },
    content: sameForBothLocales(() => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Tích hợp cổng <strong>Shopee Open API v2</strong> luôn là một trong những thử thách lớn đối với lập trình viên thương mại điện tử do tính phức tạp của hệ thống quản lý Token (Oauth 2.0) và cơ chế mã hóa chữ ký số (Request Signature).
        </p>
        <p>
          Trong bài viết này, chúng ta sẽ cùng phân tích luồng vận hành chuẩn hóa để tích hợp Shopee API vào hệ thống quản lý đơn hàng bằng Node.js và TypeScript thông qua gói thư viện <code>shopee-api-client</code>.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Khởi tạo Mô-đun</h3>
        <p>
          Để bắt đầu gọi các endpoint của Shopee, trước hết chúng ta cần có thông tin <strong>Partner ID</strong> và <strong>Partner Key</strong> được cấp bởi Shopee Open Platform. Khởi tạo đối tượng quản lý như sau:
        </p>

        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import { ShopeeModule } from "shopee-api-client";

const shopee = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
  shopId: process.env.SHOPEE_SHOP_ID,       // (Tùy chọn khi khởi tạo)
  accessToken: process.env.SHOPEE_ACCESS_TOKEN, // (Sẽ cập nhật sau khi auth)
  refreshToken: process.env.SHOPEE_REFRESH_TOKEN,
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Luồng Ủy quyền Seller (Seller Authorization Flow)</h3>
        <p>
          Đối với các dữ liệu bảo mật (đơn hàng, thông tin khách hàng, kho hàng), Shopee yêu cầu chủ cửa hàng (Seller) phải ủy quyền cho ứng dụng của bạn. Quy trình gồm 4 bước:
        </p>

        <div className="bg-white border border-zinc-200 p-5 rounded-lg shadow-2xs font-sans text-xs space-y-2">
          <p className="font-bold text-zinc-800">Quy trình Ủy Quyền Oauth 2.0:</p>
          <ol className="list-decimal pl-4 space-y-1.5 text-zinc-600">
            <li><strong>Tạo đường dẫn ủy quyền:</strong> Sử dụng phương thức sinh link có kèm redirect URL.</li>
            <li><strong>Redirect Seller:</strong> Đưa seller đến trang đăng nhập Shopee để bấm xác nhận.</li>
            <li><strong>Nhận Callback:</strong> Shopee trả về redirect URL kèm mã <code>code</code> và <code>shop_id</code>.</li>
            <li><strong>Đổi Token:</strong> Gửi request trao đổi mã <code>code</code> lấy cặp token truy cập.</li>
          </ol>
        </div>

        <p>
          Dưới đây là cách triển khai sinh link ủy quyền:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// Sinh liên kết ủy quyền chuyển hướng
const { url } = await shopee.generateAuthLink(
  "https://your-app.com/shopee/callback"
);
// Đưa seller truy cập vào url này để hoàn tất xác nhận.`}
        </pre>

        <p>
          Khi seller chấp thuận, họ sẽ được chuyển về route callback. Chúng ta tiến hành bắt lấy mã code và trao đổi lấy token:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`app.get("/shopee/callback", async (req, res) => {
  const code = req.query.code as string;
  const shopId = req.query.shop_id as string;

  const client = new ShopeeModule({
    partnerId: Number(process.env.SHOPEE_PARTNER_ID),
    partnerKey: process.env.SHOPEE_PARTNER_KEY!,
    shopId,
  });

  // Gửi API đổi lấy access token và refresh token
  const tokenData = await client.fetchToken(code);
  
  // Lưu tokenData vào cơ sở dữ liệu để tái sử dụng
  // tokenData chứa: access_token, refresh_token, expire_in
  res.json(tokenData);
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Quản lý Vòng đời Token (Token Lifecycle Management)</h3>
        <blockquote className="border-l-4 border-red-700 pl-4 italic text-zinc-600 text-sm">
          Lưu ý quan trọng: Shopee Access Token chỉ có thời hạn 4 tiếng. Refresh Token có thời hạn 30 ngày. Mỗi khi sử dụng Refresh Token để đổi Access Token mới, Shopee cũng sẽ trả về một Refresh Token mới. Bạn phải ghi đè Refresh Token cũ bằng token mới này ngay lập tức!
        </blockquote>

        <p>
          Cơ chế refresh token được tự động hóa qua thư viện như sau:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`const client = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
  shopId: "SHOPEE_SHOP_ID",
  refreshToken: "STORED_REFRESH_TOKEN",
});

// Lấy cặp token mới
const token = await client.refreshToken();
console.log(token.access_token, token.refresh_token);`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Lấy Danh sách Đơn hàng (Get Orders)</h3>
        <p>
          Khi token đã sẵn sàng, ta có thể dễ dàng lấy danh sách đơn hàng được tạo hoặc cập nhật trong thời gian gần đây:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// Shorthand: Lấy đơn hàng trong 60 phút qua
const recentOrders = await shopee.getOrders(60);

// Hoặc chi tiết bằng các bộ lọc:
const pendingOrders = await shopee.getOrders({
  beforeMinutes: 120,
  orderStatus: "READY_TO_SHIP",
  timeRangeField: "update_time",
  pageSize: 50,
});`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">5. Kết luận</h3>
        <p>
          Việc đóng gói auth flow và các method gọi API trong thư viện <code>shopee-api-client</code> giúp chúng ta tiết kiệm hàng chục giờ code tay, giảm thiểu rủi ro tính toán sai timestamp hay ký sai thuật toán mã hóa SHA256 phức tạp của Shopee.
        </p>
      </div>
    )),
  },
  {
    slug: "safe-webhook-handling",
    date: "2026-04-15",
    category: "Security",
    availableIn: ["vi"],
    title: { en: "Handling Shopee and TikTok Shop webhook pushes safely", vi: "Xử lý Webhook Push từ Shopee và TikTok Shop một cách an toàn" },
    readTime: { en: "7 min read", vi: "7 phút đọc" },
    description: { en: "Anti-forgery, HMAC-SHA256 signature verification, and keeping webhook response times low.", vi: "Giải thích cơ chế chống giả mạo request, xác thực chữ ký signature HMAC-SHA256 và tối ưu hóa thời gian phản hồi webhook." },
    content: sameForBothLocales(() => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Khi xây dựng hệ thống quản lý e-commerce, việc đồng bộ đơn hàng theo thời gian thực (real-time) là yếu tố sống còn. Cơ chế <strong>Push Mechanism (Webhook)</strong> được sử dụng để sàn đẩy thông báo về máy chủ của bạn mỗi khi đơn hàng thay đổi trạng thái.
        </p>
        <p>
          Tuy nhiên, việc mở một cổng API công khai để nhận dữ liệu từ Internet mang lại nhiều rủi ro bảo mật nghiêm trọng. Kẻ xấu có thể gửi payload giả để đánh dấu đơn hàng đã thanh toán hoặc đã hủy nhằm trục lợi.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Cơ chế Xác Thực Signature</h3>
        <p>
          Shopee gửi thông điệp webhook dưới dạng HTTP POST, kèm theo chữ ký mã hóa nằm trong header <code>Authorization</code>. Chữ ký này được tạo ra bằng thuật toán <strong>HMAC-SHA256</strong> sử dụng <code>partnerKey</code> để ký tên trên tổ hợp:
        </p>
        <div className="bg-zinc-100 p-4 rounded font-mono text-xs text-zinc-800 border border-zinc-200">
          signature = HMAC-SHA256(partnerKey, absolute_callback_url + raw_request_body)
        </div>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Quy Tắc Vàng: Nhận Raw Body</h3>
        <blockquote className="border-l-4 border-red-700 pl-4 italic text-zinc-600 text-sm">
          Cảnh báo: Bạn phải đọc req.body dưới dạng buffer thô (Raw Body). Nếu sử dụng middleware express.json() làm định dạng mặc định trước khi kiểm tra chữ ký, các trường trong payload sẽ bị sắp xếp lại thứ tự khóa (key sorting) lúc parse JSON, khiến việc tính toán hash SHA256 bị sai lệch 100%!
        </blockquote>

        <p>
          Dưới đây là cách cấu hình route nhận webhook với Express thô:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`import express from "express";
import { ShopeeModule } from "shopee-api-client";

const app = express();
const shopee = new ShopeeModule({
  partnerId: Number(process.env.SHOPEE_PARTNER_ID),
  partnerKey: process.env.SHOPEE_PARTNER_KEY!,
});

// Sử dụng express.raw để giữ nguyên chuỗi body thô gửi sang
app.post(
  "/shopee/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const callbackUrl = "https://your-app.com/shopee/webhook";
    const signature = req.header("authorization") ?? "";

    // Thực hiện verify chữ ký thô
    const isValid = shopee.verifyPushSignature(
      callbackUrl,
      req.body, // req.body ở đây là Buffer thô
      signature
    );

    if (!isValid) {
      console.warn("Cảnh báo: Webhook signature không hợp lệ!");
      return res.status(401).end();
    }

    // Sau khi verify thành công, parse JSON để xử lý dữ liệu
    const payload = shopee.parsePushPayload(req.body);
    console.log("Xử lý sự kiện code:", payload.code);

    return res.status(204).end();
  }
);`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Chiến thuật phản hồi nhanh: &ldquo;Respond Fast, Fetch Later&rdquo;</h3>
        <p>
          Shopee quy định thời gian timeout cho một request webhook là <strong>3 giây</strong>. Nếu server của bạn xử lý quá chậm (ví dụ: thực hiện ghi đè DB nhiều bảng, kiểm tra logic phức tạp), Shopee sẽ đánh giá request thất bại và liên tục gửi lại webhook (Retry theo chu kỳ 300 giây, 1800 giây, 10800 giây).
        </p>
        <p>
          Để giải quyết vấn đề này, hãy áp dụng mô hình kiến trúc bất đồng bộ:
        </p>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-700">
          <li><strong>Xác thực chữ ký lập tức:</strong> Thực hiện verify signature thô ngay khi nhận request.</li>
          <li><strong>Phản hồi HTTP 200/204:</strong> Trả về phản hồi thành công ngay lập tức để ngắt kết nối với Shopee.</li>
          <li><strong>Xử lý hàng đợi (Background Worker):</strong> Đẩy dữ liệu event vào một Message Queue (Redis, RabbitMQ) hoặc gọi hàm xử lý bất đồng bộ để Worker chạy ngầm, gọi ngược lên API Shopee lấy dữ liệu đơn hàng mới nhất và cập nhật vào DB.</li>
        </ol>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Kết luận</h3>
        <p>
          Bằng cách kết hợp giữa việc kiểm tra <strong>Signature</strong> thô và thiết kế mô hình <strong>Bất đồng bộ</strong>, bạn sẽ xây dựng được một cổng tích hợp Webhook an toàn, chịu tải tốt, và không bao giờ bị nghẽn hay trùng lặp dữ liệu đơn hàng từ các sàn.
        </p>
      </div>
    )),
  },
  {
    slug: "ecommerce-sdk-monorepo",
    date: "2026-03-28",
    category: "Architecture",
    availableIn: ["vi"],
    title: { en: "Building an e-commerce SDK monorepo with npm workspaces", vi: "Xây dựng Monorepo với npm workspaces cho các E-commerce SDKs" },
    readTime: { en: "9 min read", vi: "6 phút đọc" },
    description: { en: "Managing a multi-package project, keeping versions in sync, and streamlining releases with Changesets.", vi: "Cách thiết lập và quản lý dự án multi-package, tự động đồng bộ hóa phiên bản và tối ưu hóa quy trình release bằng Changesets." },
    content: sameForBothLocales(() => (
      <div className="font-serif-body text-[15px] text-zinc-800 leading-relaxed text-justify space-y-6">
        <p>
          Khi phát triển các bộ công cụ kết nối API đa sàn (Shopee, TikTok Shop, Lazada), việc quản lý mã nguồn dưới dạng các repository riêng biệt thường dẫn đến việc trùng lặp code cấu hình, khó đồng bộ ESLint/TypeScript và khó kiểm thử liên hoàn.
        </p>
        <p>
          Giải pháp tối ưu nhất là gom tất cả các package này vào một kho lưu trữ duy nhất sử dụng mô hình <strong>Monorepo</strong>. Trong bài viết này, chúng ta sẽ xem xét cấu trúc thực tế của monorepo kết nối thương mại điện tử bằng <strong>npm workspaces</strong> và <strong>Changesets</strong>.
        </p>

        <h3 className="font-sans font-bold text-lg text-black pt-4">1. Khai báo Workspaces trong package.json</h3>
        <p>
          Tại file <code>package.json</code> ở gốc của dự án, chúng ta sử dụng trường <code>workspaces</code> để khai báo thư mục chứa các thư viện con:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`{
  "name": "shopee-tiktok-lazada-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "@changesets/cli": "^2.31.0"
  }
}`}
        </pre>
        <p>
          Cấu trúc cây thư mục của monorepo như sau:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`shopee-tiktok-lazada-monorepo/
├── package.json
├── packages/
│   ├── shopee-api-client/       # SDK tương tác Shopee
│   ├── tiktokshops-api-client/  # SDK tương tác TikTok Shop
│   ├── lazada-api-client/       # SDK tương tác Lazada
│   └── shopee-tiktokshops-lazada-api/ # Package hợp nhất (All-in-One)
└── scripts/
    └── sync-all-in-one-deps.cjs # Tự động hóa đồng bộ dependency`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">2. Đồng bộ hóa Dependency bằng Script tự động</h3>
        <p>
          Gói hợp nhất (All-in-One) thực chất là một wrapper phụ thuộc trực tiếp vào 3 package con còn lại. Để tránh lỗi quên cập nhật phiên bản của các package con trong file dependencies của package all-in-one, ta viết một script Node.js <code>scripts/sync-all-in-one-deps.cjs</code> thực hiện quét phiên bản mới nhất ở local và cập nhật tự động:
        </p>
        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed">
{`// node scripts/sync-all-in-one-deps.cjs
// Script đọc version của shopee-api-client, tiktokshops-api-client, lazada-api-client
// rồi chèn chính xác phiên bản đó vào dependencies của gói all-in-one.`}
        </pre>

        <h3 className="font-sans font-bold text-lg text-black pt-4">3. Quản lý Phiên bản và Phát hành với Changesets</h3>
        <p>
          <strong>Changesets</strong> là giải pháp quản lý phiên bản mã nguồn cực kỳ mạnh mẽ cho monorepo. Nó giải quyết triệt để bài toán: Khi package A thay đổi, làm sao để tạo changelog và phát hành tự động?
        </p>
        <div className="bg-white border border-zinc-200 p-5 rounded-lg shadow-2xs font-sans text-xs space-y-3">
          <p className="font-bold text-zinc-800">Quy trình làm việc với Changesets:</p>
          <ul className="list-disc pl-4 space-y-1 text-zinc-600">
            <li><strong>npx changeset:</strong> Chạy khi hoàn thành một tính năng. CLI sẽ hỏi package nào đổi, thuộc loại version bump nào (patch, minor, major) và yêu cầu viết tóm tắt thay đổi.</li>
            <li><strong>npx changeset version:</strong> Chạy trước khi release. Lệnh này đọc tất cả changeset tạm thời, tự động tăng phiên bản trong các file <code>package.json</code> con và sinh ra file <code>CHANGELOG.md</code> mới.</li>
            <li><strong>npm publish --workspaces:</strong> Phát hành toàn bộ package đã được tăng phiên bản lên npm registry.</li>
          </ul>
        </div>

        <h3 className="font-sans font-bold text-lg text-black pt-4">4. Tổng kết</h3>
        <p>
          Sử dụng <strong>npm workspaces</strong> kết hợp với <strong>Changesets</strong> giúp toàn bộ hệ thống SDK được tích hợp mượt mà, dễ dàng phát triển chéo và duy trì chuẩn hóa mã nguồn trên một kho Git duy nhất.
        </p>
      </div>
    )),
  },
];
