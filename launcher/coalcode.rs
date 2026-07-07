use std::env;
use std::ffi::OsString;
use std::process::Command;

#[cfg(unix)]
use std::os::unix::process::CommandExt;

const ENTRYPOINT: &str = "/home/sal/CoalCode/packages/opencode/src/index.ts";
const PACKAGE_DIR: &str = "/home/sal/CoalCode/packages/opencode";

fn main() {
    let bun = env::var("COALCODE_BUN").unwrap_or_else(|_| "bun".to_string());
    let original_dir = env::current_dir().unwrap_or_else(|_| PACKAGE_DIR.into());
    let mut args = env::args_os().skip(1).collect::<Vec<_>>();
    if args.is_empty() {
        args.push(OsString::from(original_dir.as_os_str()));
    }

    let mut command = Command::new(bun);

    command
        .current_dir(PACKAGE_DIR)
        .arg("--conditions=browser")
        .arg(ENTRYPOINT)
        .args(args)
        .env("COALCODE", "1")
        .env("OPENCODE", "1")
        .env("PWD", original_dir);

    #[cfg(unix)]
    {
        let error = command.exec();
        eprintln!("coalcode: failed to execute Bun entrypoint: {error}");
        std::process::exit(127);
    }

    #[cfg(not(unix))]
    {
        match command.status() {
            Ok(status) => std::process::exit(status.code().unwrap_or(1)),
            Err(error) => {
                eprintln!("coalcode: failed to execute Bun entrypoint: {error}");
                std::process::exit(127);
            }
        }
    }
}
