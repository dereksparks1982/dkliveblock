//! DK Build 409: developer-only Brave engine and Apple content blocker trial.
//! Uses Brave adblock-rust's public Engine and FilterSet APIs, not copied code.
//! Input is deliberately synthetic; never feed browsing logs or private URLs.
use adblock::{Engine, FilterSet};
use adblock::lists::ParseOptions;
use adblock::request::Request;
use serde_json::{json, Value};
use std::io::{self, Read};

const MAX_INPUT: usize = 1_000_000;
const MAX_CASES: usize = 96;
const MAX_RULES: usize = 24_000;
const VERSION: &str = "0.13.5";

fn field<'a>(v: &'a Value, k: &str) -> Result<&'a str, String> {
    v.get(k).and_then(Value::as_str).ok_or_else(|| format!("missing or invalid {}", k))
}
fn synthetic_domain(host: &str) -> bool {
    host == "example" || (host.ends_with(".example")
        && host.len() > 8
        && host.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '.' || c == '-'))
}
fn safe_url(raw: &str) -> bool {
    if raw.len() > 2048 { return false; }
    let authority = match raw.strip_prefix("https://").or_else(|| raw.strip_prefix("http://"))
        .or_else(|| raw.strip_prefix("wss://")) {
        Some(rest) => rest.split(&['/', '?', '#'][..]).next().unwrap_or(""),
        None => return false
    };
    synthetic_domain(authority)
}
fn check_cases(input: &Value) -> Result<Value, String> {
    let cases = input.get("cases").and_then(Value::as_array).ok_or("cases array required")?;
    if cases.is_empty() || cases.len() > MAX_CASES { return Err("case count outside bounds".into()); }
    let mut output = Vec::with_capacity(cases.len());
    let mut seen = std::collections::HashSet::new();
    for row in cases {
        let id = field(row, "id")?;
        let rules = field(row, "rules")?;
        let url = field(row, "url")?;
        let kind = field(row, "type")?;
        let origin = field(row, "origin")?;
        let method = row.get("method").and_then(Value::as_str).unwrap_or("GET");
        if id.is_empty() || id.len() > 60 || !id.bytes().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
            || !seen.insert(id.to_string()) || rules.len() > MAX_RULES || !safe_url(url)
            || !synthetic_domain(origin) || kind.len() > 25 || method.len() > 12 {
            return Err("unsafe or malformed synthetic case".into());
        }
        let mut set = FilterSet::new(false);
        set.add_filter_list(rules.to_string(), ParseOptions::default());
        let engine = Engine::new_with_filter_set(set);
        let source = format!("https://{origin}/");
        let request = Request::new(url, &source, kind, method)
            .map_err(|_| "invalid synthetic request")?;
        let verdict = engine.check_network_request(&request);
        output.push(json!({
            "id": id, "blocked": verdict.should_block(),
            "exception": verdict.exception.is_some(), "redirect": verdict.redirect.is_some()
        }));
    }
    Ok(json!({"schema":1,"engine":"brave-adblock-rust","crateVersion":VERSION,"cases":output}))
}
fn convert_safari(input: &Value) -> Result<Value, String> {
    let rules = field(input, "rules")?;
    if rules.len() > MAX_RULES || rules.lines().count() > 128 || rules.is_empty() {
        return Err("synthetic conversion list outside bounds".into());
    }
    let mut set = FilterSet::new(true); // required by Brave's upstream converter
    set.add_filter_list(rules.to_string(), ParseOptions::default());
    let (converted, used) = set.into_content_blocking()
        .map_err(|_| "Brave Apple conversion rejected this rule set")?;
    if converted.len() > 1024 { return Err("converted rule count outside bounds".into()); }
    Ok(json!({
        "schema": 1, "engine": "brave-adblock-rust",
        "crateVersion": VERSION, "format": "apple-content-blocker-v1",
        "inputRuleLines": rules.lines().filter(|x| !x.trim().is_empty()).count(),
        "convertedSourceRuleCount": used.len(),
        "rules": converted
    }))
}
fn run() -> Result<(), String> {
    if std::env::args().len() != 1 { return Err("no command-line options: JSON stdin only".into()); }
    let mut input = String::new();
    io::stdin().take(MAX_INPUT as u64 + 1).read_to_string(&mut input)
        .map_err(|_| "unable to read synthetic input")?;
    if input.len() > MAX_INPUT { return Err("input exceeds 1 MB".into()); }
    let value: Value = serde_json::from_str(&input).map_err(|_| "malformed JSON")?;
    if value.get("schema").and_then(Value::as_u64) != Some(1) {
        return Err("unsupported schema".into());
    }
    let report = match field(&value, "mode")? {
        "compare" => check_cases(&value)?,
        "safari" => convert_safari(&value)?,
        _ => return Err("unsupported developer-only mode".into()),
    };
    println!("{}", serde_json::to_string(&report).map_err(|_| "serialization failure")?);
    Ok(())
}
fn main() {
    if let Err(reason) = run() {
        eprintln!("DK Brave offline harness: {reason}");
        std::process::exit(1);
    }
}
